const result = await Bun.build({
  entrypoints: ['./aho.tsx'],
  outdir: './out',
  // minify: true,
  // external: ["react"],
});

console.log(await result.outputs[0].text());
