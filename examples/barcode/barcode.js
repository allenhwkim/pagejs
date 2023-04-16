import {loadScript, waitFor} from '../../lib';

export default {
  tagName: 'my-barcode',
  shadow: true,
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
  css: 'hello {background: #ccc;}',
  constructorCallback() {
    loadScript('//unpkg.com/jsbarcode/dist/JsBarcode.all.min.js');
    this.host.innerHTML = '<svg></svg>';
  },
  async render({attrs, props}) { 
    await waitFor('window.JsBarcode');
    const value = attrs.value || '123456789012'; 
    const format = attrs.format || 'code128';
    const svgEl = document.createElement('svg');
    window['JsBarcode'](svgEl, value, {...props, format});
    return svgEl;
  }
}