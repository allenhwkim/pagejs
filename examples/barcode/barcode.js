import {loadScript, waitFor} from '../../lib';

export default {
  tagName: 'my-barcode',
  observedAttributes: ['value', 'format'],
  props : {
    width: 1,
    background: '#FFFFFF',
    lineColor: '#000000',
    margin: 10,
    displayValue: true,
    font: 'monospace',
    fontSize: 20,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontOptions: 'bold',
  },
  constructorCallback() {
    loadScript('//unpkg.com/jsbarcode/dist/JsBarcode.all.min.js');
  },
  async render({attrs, props}) { 
    await waitFor('window.JsBarcode');
    const value = attrs.value || '123456789012'; 
    const format = attrs.format || 'code128';
    const svgEl = document.createElement('svg');
    window['JsBarcode'](svgEl, value, {...props, format});
    return svgEl.outerHTML;
  }
}