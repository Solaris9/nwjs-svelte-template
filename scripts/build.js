import { build, mergeConfig } from "vite";
import "./_cache.js";
import { cp, writeFile } from "fs/promises";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { base, transformImports } from "./_shared.js";
import download from "./_cache.js";
import pkg from "../package.json" assert { type: "json" };
import os from "os";

const bin = await download();

await build(mergeConfig(base, {
  plugins: [
    svelte(),
    transformImports()
  ],
}));

const dir = process.cwd();
const src = path.join(dir, "dist");
const nw = path.join(dir, bin);
const platform = os.platform();

let dist;

if (platform == "darwin") {
  dist = `${nw}/nwjs.app/Contents/Resources/app.nw`
} else if (platform == "win32" || platform == "linux") {
  dist = `${nw}/package.nw`;
}

await cp(src, dist, { recursive: true });
await writeFile(path.join(dist, "package.json"), JSON.stringify({
  name: pkg.name,
  version: pkg.version,
  main: "index.html"
}));