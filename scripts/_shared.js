/** @type {import("vite").UserConfig} */
export const base = {
  base: "",
  build: {
    outDir: "dist"
  }
}

/** @returns {import("vite").Plugin} */
export function transformImports() {
  const importRegex = /import \* as (\w+) from "node:(.+)";/g;
  return {
    name: 'transform-imports',
    transform(code) {
      const matches = code.matchAll(importRegex);

      for (let [match, variable, name] of matches) {
        code = code.replace(match, `const ${variable} = require("${name}");`);
      }

      return { code }
    },
  }
}

/** @returns {import("vite").Plugin} */
export function includeLiveReload() {
  /** @type {import("vite").UserConfig} */
  let config;
  return {
    name: "include-live-reload",
    config(c) {
      config = c;
    },
    transform(code, id) {
      if (id.endsWith("src/main.ts")) {
        const base = config.build.outDir ?? "dist";

        code += `const gulp = require('gulp');
        gulp.watch(['./public','./${base}'], () => {
          if (location) location.reload();
        });`

        return { code };
      }
    }
  }
}