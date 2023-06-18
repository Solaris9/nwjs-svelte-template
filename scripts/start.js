import { base, includeLiveReload, transformImports } from "./_shared.js";
import { build, mergeConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { spawn } from "child_process";
import { exit } from "process";
import { bin } from "./_cache.js";
import gulp from "gulp";
import path from "path";
import os from "os";

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
} else if (platform == "linux") {
  command = `${nw}/nw`;
}

const child = spawn(`${command} ${dir}`, { shell: true });
child.on("close", () => exit(0));

