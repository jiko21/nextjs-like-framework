import { describe, test, expect } from "bun:test";
import { _genPathInfo, _sort } from "./ssrMiddleware";

describe("_genPathInfo", () => {
  test.each([
    {
      basePath: ['index.tsx'],
      expected: {
        filePath: 'index.tsx',
        depth: 0,
        importPath: '/root/src/pages',
        path: '',
        slugs: []
      },
    },
    {
      basePath: ['hoge.tsx'],
      expected: {
        filePath: 'hoge.tsx',
        depth: 1,
        importPath: '/root/src/pages/hoge',
        path: 'hoge',
        slugs: []
      },
    },
    {
      basePath: ['sample','hoge','fuga.tsx'],
      expected: {
        filePath: 'sample/hoge/fuga.tsx',
        depth: 3,
        importPath: '/root/src/pages/sample/hoge/fuga',
        path: 'sample/hoge/fuga',
        slugs: []
      },
    },
    {
      basePath: ['sample','hoge','fuga', 'index.tsx'],
      depth: 3,
      expected: {
        filePath: 'sample/hoge/fuga/index.tsx',
        depth: 3,
        importPath: '/root/src/pages/sample/hoge/fuga',
        path: 'sample/hoge/fuga',
        slugs: []
      },
    },
    {
      basePath: ['sample','[hoge]','[fuga]', 'index.tsx'],
      expected: {
        filePath: 'sample/[hoge]/[fuga]/index.tsx',
        depth: 3,
        importPath: '/root/src/pages/sample/[hoge]/[fuga]',
        path: 'sample/:hoge/:fuga',
        slugs: ['hoge', 'fuga']
      },
    },
    {
      basePath: ['sample','[hoge]','[fuga].tsx'],
      expected: {
        filePath: 'sample/[hoge]/[fuga].tsx',
        depth: 3,
        importPath: '/root/src/pages/sample/[hoge]/[fuga]',
        path: 'sample/:hoge/:fuga',
        slugs: ['hoge', 'fuga']
      },
    }
  ])('_genPathInfo($basePath)', ({ basePath, expected }) => {
    expect(_genPathInfo(basePath, '/root/src/pages')).toEqual(expected)
  })
});

test('_sort', () => {
  const pathData= [
    {
      importPath: './pages',
      filePath: 'index.tsx',
      depth: 0,
      path: '',
      slugs: []
    },
    {
      importPath: './pages/hoge',
      filePath: 'hoge.tsx',
      depth: 1,
      path: 'hoge',
      slugs: []
    },
    {
      importPath: './pages/sample/hoge/fuga',
      filePath: 'sample/hoge/fuga.tsx',
      depth: 3,
      path: 'sample/hoge/fuga',
      slugs: []
    },
    {
      importPath: './pages/sample/[hoge]/[fuga]',
      filePath: 'sample/[hoge]/[fuga].tsx',
      depth: 3,
      path: 'sample/:hoge/:fuga',
      slugs: ['hoge', 'fuga']
    },

  ]
  const expected = [
    {
      importPath: './pages/sample/hoge/fuga',
      filePath: 'sample/hoge/fuga.tsx',
      depth: 3,
      path: 'sample/hoge/fuga',
      slugs: []
    },
    {
      importPath: './pages/sample/[hoge]/[fuga]',
      filePath: 'sample/[hoge]/[fuga].tsx',
      depth: 3,
      path: 'sample/:hoge/:fuga',
      slugs: ['hoge', 'fuga']
    },
    {
      importPath: './pages/hoge',
      filePath: 'hoge.tsx',
      depth: 1,
      path: 'hoge',
      slugs: []
    },
    {
      importPath: './pages',
      filePath: 'index.tsx',
      depth: 0,
      path: '',
      slugs: []
    },
  ]
  expect(_sort(pathData)).toEqual(expected)
})
