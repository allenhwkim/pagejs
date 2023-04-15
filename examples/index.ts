
import barcodeHtml from './barcode/barcode.html?raw';
import barcodeOpts from './barcode/barcode.ts?raw';
import fileHtml from './file/file.html?raw';
import fileOpts from './file/file.js?raw';
import fileCss from './file/file.css?inline';
import hlOpts from './highlight/highlight.js?raw';
import hlHtml from './highlight/highlight.html?raw';

function getObjStr(script: string) {
  // extraxt only inside '{...}'
  return script.replace(/^[\s\S]+export default/, '').replace(/}[\s\S]$/, '}')
}
``
export default {
  barcode:   {in: getObjStr(barcodeOpts), out: barcodeHtml},
  file:      {in: getObjStr(fileOpts),    out: fileHtml,   css: fileCss},
  highlight: {in: getObjStr(hlOpts),      out: hlHtml},
}
