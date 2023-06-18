import { spawn } from "child_process";
import { bin } from "./_cache.js";
import os from "os";
import path from "path";

const dir = process.cwd();
const nw = path.join(dir, bin);
const platform = os.platform();

let command;

if (platform == "darwin") {
    command = `open -n ${nw}/nwjs.app`
} else if (platform == "win32") {
    command = `start ${nw}/nw.exe`;
} else if (platform == "linux") {
    command = `${nw}/nw`;
}

spawn(command, { shell: true });
