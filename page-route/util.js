import fs from 'fs';
import pako from 'pako';
import path from 'path';

/**
 * compress the given string to pako-deflated string
*/
export function encode(str) {
  const uint8arr = pako.deflate(str);
  return String.fromCharCode.apply(null, new Uint8Array(uint8arr));
}

/**
 * decode deflated binary string to json object;
 */
export function decode(str) {
  const arrayBuffer = new ArrayBuffer(str.length * 1);
  const newUint = new Uint8Array(arrayBuffer);
  newUint.forEach((_, i) => newUint[i] = str.charCodeAt(i));

  // Decompress Unit8Array
  const unit8arr = pako.inflate(newUint);
  const decodedStr = String.fromCharCode.apply(null, new Uint8Array(unit8arr))
  try {
    return JSON.parse(decodedStr);
  } catch(e) {
    return decodedStr;
  }
}


/**
 * execute callback on every file recursively of a directory 
 */
export function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?  walkDir(dirPath, callback) : callback(path.join(dir, file));
  });
};

/**
 * usage getNestedValue({a: {b: {c: 'd'}}}, 'a.b.c')
 */
export function getNestedValue(obj, keys) {
  return keys.split('.').reduce(function(o, x) {
    return (typeof o == 'undefined' || o === null) ? o : o[x];
  }, obj);
}

/**
 * usage setNestedValue(myVar, 'a.b.c.d', 'hello')
 * myVar.a.b.c.d === 'hello'
 */
export function setNestedVal(obj, keys, val) {
  const keysArr = keys.split('.');
  keysArr.reduce( (o, x, i) => {
    if (i === keysArr.length - 1) { // last item
      o[x] = val;
    } else if (!o[x]) { // not last item, and obj not exists
      o[x] = {};
    }
    return o[x]
  }, obj);
}