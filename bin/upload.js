#! /usr/bin/env node
import AdmZip from 'adm-zip';
import Axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import https from 'https';
import { program } from 'commander';
import { getConfig, regexSemver } from "./utils.js";

export const upload = async (options) => {
    const config = await getConfig();
    let version = options.bundle || config?.app?.package?.version
    // check if bundle is valid
    if (!regexSemver.test(version)) {
        program.error(`Your bundle version '${version}' is not valid. It should follow semver conventions: https://semver.org/`);
    }

    // Create a new AdmZip instance
    const zip = new AdmZip();

    const dir = options.dir ?? './dist/';
    if (!fs.existsSync(dir)) {
        program.error(`ERROR: The specified directory '${dir}' does not exist.`);
        return;
    }

    // Add the contents of the ./dist folder to the zip file
    zip.addLocalFolder(dir);

    // Write the zip file to disk
    zip.writeZip('bundle.zip');

    // // Read the contents of the app.zip file as a Buffer
    const zipBuffer = await fs.readFileSync('bundle.zip');

    if (!options.secret) {
        program.error('ERROR: No API key was set!')
        return;
    }

    if (!options.url) {
        program.error('ERROR: No upload URL was set!')
        return;
    }

    let formData = new FormData();
    formData.append('bundle', zipBuffer, 'bundle.zip');
    formData.append('version', version);
    formData.append('secret', options.secret);

    const headers = {
        'Content-Type': `multipart/form-data`
    };

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    // Send the POST request with the zip file as the request body
    try {
        await Axios.post(options.url, formData, { headers, httpsAgent: agent });
    } catch (error) {
        switch (error?.response?.status) {
            case 409:
                program.error('This bundle version already exists.');
                break;
            default:
                console.log(error)
                program.error(`Something unexpectedly went wrong. Check the server logs for more information.`);
                break;
        }
    }

    console.log(`App version ${version} uploaded to the server`);
}
