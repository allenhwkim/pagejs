import {loadScript, waitFor} from '../../lib';

export default {
  tagName: 'my-barcode',
  async resolve() {
    loadScript('//unpkg.com/jsbarcode/dist/JsBarcode.all.min.js');
    await waitFor('window.JsBarcode');
  },
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
  connectedCallback() {
    this.innerHTML = '<svg></svg>';
  },
  render({attrs, props}) { 
    const value = attrs.value || '123456789012'; 
    const format = attrs.format || 'code128';
    window['JsBarcode'](this.firstChild, value, {...props, format});
  }
}