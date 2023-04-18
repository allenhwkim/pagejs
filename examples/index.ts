
import barcodeHtml from './barcode/barcode.html?raw';
import barcodeOpts from './barcode/barcode.js?raw';

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

import qrcodeHtml from './qrcode/qrcode.html?raw';
import qrcodeOpts from './qrcode/qrcode.js?raw';

import maskHtml from './input-mask/input-mask.html?raw';
import maskOpts from './input-mask/input-mask.js?raw';
import maskCss  from './input-mask/input-mask.css?inline';

import comboHtml from './combobox/combobox.html?raw';
import comboOpts from './combobox/combobox.js?raw';
import comboCss  from './combobox/combobox.css?inline';

import defaultHtml from './hello-world/hello-world.html?raw';
import defaultOpts from './hello-world/hello-world.js?raw';

import resizeHtml from './resize-divs/resize-divs.html?raw';
import resizeOpts from './resize-divs/resize-divs.js?raw';
import resizeCss  from './resize-divs/resize-divs.css?inline';

function getObjStr(script: string) {
  // extraxt only inside '{...}'
  return script.replace(/^[\s\S]*export default/, '').replace(/\}[\s;]*$/, '}')
}

export default {
  default:    {in: getObjStr(defaultOpts),  out: defaultHtml},
  qrcode:     {in: getObjStr(qrcodeOpts),  out: qrcodeHtml},
  barcode:    {in: getObjStr(barcodeOpts), out: barcodeHtml},
  highlight:  {in: getObjStr(hlOpts),      out: hlHtml},
  map:        {in: getObjStr(mapOpts),     out: mapHtml},
  pagination: {in: getObjStr(pgnOpts),     out: pgnHtml,    css: pgnCss},
  file:       {in: getObjStr(fileOpts),    out: fileHtml,   css: fileCss},
  list:       {in: getObjStr(listOpts),    out: listHtml,   css: listCss},
  inputmask:  {in: getObjStr(maskOpts),    out: maskHtml,   css: maskCss},
  combobox:   {in: getObjStr(comboOpts),   out: comboHtml,  css: comboCss},
  resize:     {in: getObjStr(resizeOpts),  out: resizeHtml, css: resizeCss},
}
