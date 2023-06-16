import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

function transformImports() {
  const importRegex = /import \* as (\w+) from "node:(.+)";/g;
  return {
    name: 'transform-imports',
    transform(src: string) {
      const matches = src.matchAll(importRegex);

      for (let [match, variable, name] of matches) {
        src = src.replace(match, `const ${variable} = require("${name}");`);
      }

      return {
        code: src,
        map: null
      }
    },
  }
}

export default defineConfig({
  plugins: [
    svelte(),
    transformImports()
  ],
  base: ""
})
