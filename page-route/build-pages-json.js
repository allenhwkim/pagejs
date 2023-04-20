#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { compress, decompress } from './compress.js';

const [_0, _1, pagesPath='./pages', outputPath='./pages.json'] = process.argv;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?  walkDir(dirPath, callback) : callback(path.join(dir, file));
  });
};

function main(pagesPath, outputPath) {
  const pagesVar = {};
  walkDir(pagesPath, function(filePath) {
    const url = path.resolve(filePath).replace(new RegExp(`^${path.resolve(pagesPath)}`), '');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const pathName = 'pagesVar' + path.dirname(url).replace(/\//g, '.').replace(/\.$/, '');
    const keyName = path.basename(url);
    new Function( 'pagesVar', 'contents', 'decompressed', `
      ${pathName} = ${pathName} || {};
      ${pathName}['${keyName}'] = contents; //console.log(decompressed);
    `)(pagesVar, compress(fileContents), decompress(compress(fileContents)));
  });
  fs.writeFileSync(path.join(outputPath), JSON.stringify(pagesVar, null, '  '))
}

main(pagesPath, outputPath);