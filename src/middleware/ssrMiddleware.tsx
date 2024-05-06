import { Context, Hono } from 'hono'
import { Glob } from 'bun';
import path from 'node:path'
import { renderToString } from 'react-dom/server.browser';

const SLUG_PARAM_PATTERN = /^\[(.+)\]$/
const SLUG_FILE_ARAM_PATTERN = /^\[(.+)\]\.tsx$/

export type GetServersidePropsResult<T> = {
  props: T;
};

export type GetServersideProps<T> = (ctx: Context) => (GetServersidePropsResult<T> | Promise<GetServersidePropsResult<T>>)

export function _genPathInfo(source: string[], basePath: string) {
  const outputPath = []
  const importPath = []
  const slugs = []
  let depth = 0;
  const basePaths = source.slice(0, source.length - 1)
  for (const basePath of basePaths) {
    depth += 1;
    const slugPattern = basePath.match(SLUG_PARAM_PATTERN)
    if (slugPattern) {
      slugs.push(slugPattern.at(1));
      outputPath.push(`:${slugPattern.at(1)}`);
    } else {depth
      outputPath.push(basePath);
    }
    importPath.push(basePath)
  }
  const action = source.at(-1);
  if (action !== 'index.tsx') {
    depth += 1;
    const slugPattern = action?.match(SLUG_FILE_ARAM_PATTERN)
    if (slugPattern) {
      outputPath.push(`:${slugPattern.at(1)}`);
      slugs.push(slugPattern.at(1));
    } else {
      outputPath.push(action?.replace('.tsx', ''));
    }
    importPath.push(action?.replace('.tsx', '') ?? '');
  }
  return {
    path: outputPath.join('/'),
    importPath: path.join(basePath, importPath.join('/')),
    filePath: path.join(basePath, source.join('/')),
    depth,
    slugs,
  }
}

export function _sort(inputs: ReturnType<typeof _genPathInfo>[]) {
  return inputs.toSorted((a, b) => {
    if (a.depth != b.depth) {
      return b.depth - a.depth
    }
    return a.slugs.length - b.slugs.length
  })
}

export async function genRoute() {
  const page = new Hono();

  const glob = new Glob('**/*.tsx');
  const paths = []

  for await (const file of glob.scan(path.join(process.cwd(), 'src/pages'))) {
    const pathInfo = _genPathInfo(file.split('/'), path.join(process.cwd(), 'src/pages'))
    paths.push(pathInfo)
  }

  const sortedPaths = _sort(paths);
  sortedPaths.forEach((pathInfo) =>
    page.get(pathInfo.path, async (c) => {
      const {default: App, getServersideProps} = await import(`${pathInfo.importPath}`) as { default: React.FC<GetServersidePropsResult<Object>['props']>, getServersideProps: GetServersideProps<Object> };
      const result = getServersideProps ? await getServersideProps(c) : { props: {} };
      const src = renderToString(
        <html>
          <head></head>
          <body>
            <div id="root">
              <App {...result.props} />
            </div>
          </body>
          <script type="application/json" id="getServersidePropsData" dangerouslySetInnerHTML={{ __html: JSON.stringify(result.props) }}>
          </script>
          <script src={`/build/${pathInfo.path}asset.js`} />
        </html>
      );
      return c.html(src)
    })
    .get(`/build/${pathInfo.path}asset.js`, async (c) => {
      const data = `
import App from '${pathInfo.filePath}';

import { hydrateRoot } from 'react-dom/client';
const root = document.getElementById('root');
const propsStr = document.getElementById("getServersidePropsData");
const props = JSON.parse(propsStr.textContent);
hydrateRoot(root, <App {...props} />);`;
      await Bun.write(`./out/${pathInfo.path}asset.tsx`, data);
      const result = await Bun.build({
        entrypoints: [`./out/${pathInfo.path}asset.tsx`],
      });
      return c.body((await result.outputs[0].text()), 200, {
        'Content-Type': 'text/javascript',
      });
    }),
  );
  return page;
}
