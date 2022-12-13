#! /usr/bin/env node
import { program } from 'commander';
import { upload } from './upload.js';

program
  .description('SportIT CLI tool')
  .version('1.0.7');

program
  .command('upload')
  .alias('u')
  .description('Upload a new bundle to the server')
  .action(upload)
  .option('-s, --secret <secret>', 'Secret for uploading the file to the server')
  .option('-u, --url <url>', 'URL where the file should be uploaded')

program.parse(process.argv);
