#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { encode, walkDir, setNestedVal } from './util.js';

const options = program
  .option('-p, --pages-path', 'pages directory path', path.resolve('./pages'))
  .option('-o, --output-path', 'output file name', path.resolve('./public/pages.data'))
  .parse(process.argv).opts();

const {pagesPath, outputPath} = options;
const pagesVar = {};

walkDir(pagesPath, filePath => {
  const url = path.resolve(filePath).replace(new RegExp(`^${path.resolve(pagesPath)}`), '');
  if (fs.statSync(filePath).isFile()) {
    const keys = url.replace(/\//g, '.').replace(/^\.|\.html$/g, '');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const slotLen = (fileContents.match(/<slot><\/slot>/g) || []).length;
    if (filePath.endsWith('template.html') && slotLen !== 1) {
      throw 'template file must have one <slot></slot>';
    }
    setNestedVal(pagesVar, keys, fileContents);
  }
});

const json = JSON.stringify(pagesVar);
const encoded = encode(json);
console.log(JSON.stringify(pagesVar, null, '  '));
fs.writeFileSync(path.join(outputPath), encoded);