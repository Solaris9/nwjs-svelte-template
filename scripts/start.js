import { base, includeLiveReload, transformImports } from "./_shared.js";
import { build, mergeConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { spawn } from "child_process";
import { exit } from "process";
import download from "./_cache.js";
import { rm } from "fs/promises";
import gulp from "gulp";
import path from "path";
import os from "os";

const bin = await download(true);

async function buildFiles(done) {
  await build(mergeConfig(base, {
    plugins: [
      includeLiveReload(),
      svelte(),
      transformImports()
    ],
  }));

  done && done();
};

console.log("Launching app...");

buildFiles()
gulp.watch(['./public', './src'], buildFiles);

const dir = process.cwd();
const nw = path.join(dir, bin);
const platform = os.platform();

let command;

if (platform == "darwin") {
  command = `${nw}/nwjs.app/Contents/MacOS/nwjs`;
} else if (platform == "win32") {
  command = `${nw}/nw.exe`;
  await rm(`${nw}/nwjs.app/Contents/Resources/app.nw`);
} else if (platform == "linux") {
  command = `${nw}/nw`;
}

// remove previous build
if (platform == "darwin") {
  await rm(`${nw}/nwjs.app/Contents/Resources/app.nw`, { force: true, recursive: true });
} else if (platform == "linux" || platform == "win32") {
  await rm(`${nw}/package.nw`, { force: true, recursive: true });
}

const child = spawn(`${command} ${dir}`, { shell: true });
child.on("close", () => exit(0));