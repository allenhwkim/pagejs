#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { encode, walkDir, setNestedVal } from './util.js';

const [_0, _1, pagesPath='./pages', outputPath='./public/pages.data'] = process.argv;

const pagesVar = {};

walkDir(pagesPath, filePath => {
  const url = path.resolve(filePath).replace(new RegExp(`^${path.resolve(pagesPath)}`), '');
  if (fs.statSync(filePath).isFile()) {
    const keys = url.replace(/\//g, '.').replace(/^\.|\.html$/g, '');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const value = keys.endsWith('/template') ? fileContents + '<slot></slot>' : fileContents;
    setNestedVal(pagesVar, keys, value);
  }
});

const json = JSON.stringify(pagesVar);
const encoded = encode(json);
fs.writeFileSync(path.join(outputPath), encoded);