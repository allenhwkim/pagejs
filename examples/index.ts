
import barcodeHtml from './barcode/barcode.html?raw';
import barcodeOpts from './barcode/barcode.ts?raw';

import fileHtml from './file/file.html?raw';
import fileOpts from './file/file.js?raw';
import fileCss from './file/file.css?inline';

import hlOpts from './highlight/highlight.js?raw';
import hlHtml from './highlight/highlight.html?raw';

import listHtml from './list/list.html?raw';
import listOpts from './list/list.js?raw';
import listCss from './list/list.css?inline';

import mapHtml from './map/map.html?raw';
import mapOpts from './map/map.js?raw';

import pgnHtml from './pagination/pagination.html?raw';
import pgnOpts from './pagination/pagination.js?raw';
import pgnCss  from './pagination/pagination.css?inline';

function getObjStr(script: string) {
  // extraxt only inside '{...}'
  return script.replace(/^[\s\S]+export default/, '').replace(/}[\s\S]$/, '}')
}
``
export default {
  barcode:    {in: getObjStr(barcodeOpts), out: barcodeHtml},
  file:       {in: getObjStr(fileOpts),    out: fileHtml,   css: fileCss},
  highlight:  {in: getObjStr(hlOpts),      out: hlHtml},
  list:       {in: getObjStr(listOpts),    out: listHtml,   css: listCss},
  map:        {in: getObjStr(mapOpts),     out: mapHtml},
  pagination: {in: getObjStr(pgnOpts),     out: pgnHtml,    css: pgnCss},
}
