#! /usr/bin/env node
import AdmZip from 'adm-zip';
import Axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import https from 'https';

export const upload = async (version, options) => {
    // Create a new AdmZip instance
    const zip = new AdmZip();

    const dir = options.dir ?? './dist/';
    if (!fs.existsSync(dir)) {
        console.error(`ERROR: The specified directory '${dir}' does not exist.`);
        return;
    }
    
    // Add the contents of the ./dist folder to the zip file
    zip.addLocalFolder(dir);
    
    // Write the zip file to disk
    zip.writeZip('bundle.zip');

    // // Read the contents of the app.zip file as a Buffer
    const zipBuffer = await fs.readFileSync('bundle.zip');

    if (!options.secret) {
        console.error('ERROR: No API key was set!')
        return;
    }

    if (!options.url) {
        console.error('ERROR: No upload URL was set!')
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

    // // Send the POST request with the zip file as the request body
    const response = await Axios.post(options.url, formData, { headers, httpsAgent: agent });
    console.log(response.data);
}
