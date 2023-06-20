import fs from "fs/promises";
import path from "path";
import os from "os";
import { exit } from "process";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import extract from "extract-zip";

// setup

const cacheDir = path.join(process.cwd(), ".cache");
const cacheExists = await exists(cacheDir);
if (!cacheExists) await fs.mkdir(cacheDir);

export default async (sdk = false) => {
    const [url, platform, arch] = getDownloadURL(sdk);
    if (!url) {
        console.log(`Failed to find download for ${platform}-${arch}, please check your system platform and architecture.`);
        exit(1);
    }

    const name = url.slice(url.lastIndexOf("/") + 1).replace(/(\.zip|\.tar\.gz)/, "");
    const files = await fs.readdir(cacheDir);
    const binExists = files.includes(name);

    // downloading

    const zipFile = path.join(cacheDir, `${name}.zip`);
    const zipExists = await exists(zipFile);

    if (!zipExists) {
        console.log(`Downloading ${sdk ? "sdk" : ""} NW.js for: ${platform}-${arch}`);

        const res = await fetch(url);

        // write zip
        const fileStream = createWriteStream(zipFile, { flags: 'wx' });
        await finished(Readable.fromWeb(res.body).pipe(fileStream));

        console.log("Finished downloading binary!");
    } 

    // extract zip
    if (!binExists) await extract(zipFile, { dir: cacheDir });

    // return the selected binary location
    return path.join(process.cwd(), ".cache", name);
}

// utils

function getDownloadURL(sdk) {
    const baseDownloadURL = `https://dl.nwjs.io/v0.77.0/nwjs-${sdk ? `sdk-` : ""}v0.77.0`;

    const platform = os.platform();
    const arch = os.arch();
    let url = null;

    if (platform == "darwin") url = `${baseDownloadURL}-osx-x64.zip`;

    if (platform == "linux") url = `${baseDownloadURL}-linux-${arch}.tar.gz`;

    // @ts-ignore apparently win32 is not an option for typing
    if (platform == "win32") url = `${baseDownloadURL}-win-${arch}.zip`;

    return [url, platform, arch];
}

async function exists(dir) {
    try {
        await fs.stat(dir);
        return true;
    } catch {
        return false;
    }
}