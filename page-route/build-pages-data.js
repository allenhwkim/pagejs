#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import pako from 'pako';

// compress the given string to pako-deflated string
function encode(str) {
  const uint8arr = pako.deflate(str);
  return String.fromCharCode.apply(null, new Uint8Array(uint8arr));
}

const [_0, _1, pagesPath='./pages', outputPath='./public/pages.data'] = process.argv;

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
    const keyName = path.basename(url).replace(/\.html$/, '');
    new Function( 'pagesVar', 'contents', `
      ${pathName} = ${pathName} || {};
      ${pathName}['${keyName}'] = contents;
    `)(pagesVar, fileContents);
  });

  const json = JSON.stringify(pagesVar);
  const encoded = encode(json);
  fs.writeFileSync(path.join(outputPath), encoded)
}

main(pagesPath, outputPath);