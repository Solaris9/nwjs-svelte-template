import fs from "fs/promises";
import path from "path";
import os from "os";
import { exit } from "process";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import http from "http";
import extract from "extract-zip";

// setup

const cacheDir = path.join(process.cwd(), ".cache");
const cacheExists = await exists(cacheDir);
if (!cacheExists) await fs.mkdir(cacheDir);

const url = getDownloadURL();
if (!url) {
    console.log("Failed to find download, please check your system platform and architecture.");
    exit(1);
}

const name = url.slice(url.lastIndexOf("/") + 1).replace(/(\.zip|\.tar\.gz)/, "");
export const bin = `.cache/${name}`;

const files = await fs.readdir(cacheDir);
const binExists = files.includes(name);

// downloading

const zipFile = path.join(cacheDir, `${name}.zip`);
const zipExists = await exists(zipFile);

if (!zipExists) {
    console.log("Downloading binary...");

    const res = await fetch(url);

    // write zip
    const fileStream = createWriteStream(zipFile, { flags: 'wx' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));

    console.log("Finished downloading binary!");
} 

// extract zip
if (!binExists) await extract(zipFile, { dir: cacheDir });

console.log("Finished setup...");

// utils

function getDownloadURL() {
    const baseDownloadURL = "https://dl.nwjs.io/v0.77.0/nwjs-sdk-v0.77.0";

    const platform = os.platform();
    const arch = os.arch();

    console.log(`Fetching NW.js for: ${platform}-${arch}`);

    if (platform == "darwin") return `${baseDownloadURL}-osx-x64.zip`;

    if (platform == "linux") return `${baseDownloadURL}-linux-${arch}.tar.gz`;

    // @ts-ignore apparently win32 is not an option for typing
    if (platform == "win32") return `${baseDownloadURL}-win-${arch}.zip`;

    return null;
}

async function exists(dir) {
    try {
        await fs.stat(dir);
        return true;
    } catch {
        return false;
    }
}