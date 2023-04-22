#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { encode, walkDir, setNestedVal } from './util.js';

const [_0, _1, pagesPath='./pages', outputPath='./public/pages.data'] = process.argv;

function main(pagesPath, outputPath) {
  const pagesVar = {};

  walkDir(pagesPath, filePath => {
    const url = path.resolve(filePath).replace(new RegExp(`^${path.resolve(pagesPath)}`), '');
    if (fs.statSync(filePath).isFile()) {
      const keys = url.replace(/\//g, '.').replace(/^\.|\.html$/g, '');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      setNestedVal(pagesVar, keys, fileContents);
    }
  });

  const json = JSON.stringify(pagesVar);
  const encoded = encode(json);
  fs.writeFileSync(path.join(outputPath), encoded);
  // console.log(JSON.stringify(pagesVar, null, '  '));
}

main(pagesPath, outputPath);