import './style.css'

import { codeCustomElement } from './lib2/code-custom-element';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

const proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@latest/min/' };
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

const defaultInputTxt =  ` 
codeCustomElement('my-barcode', {
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
})`;

const str = sessionStorage.getItem('inputTxt') || defaultInputTxt.trim();
const inputEl = document.querySelector('#input');
const outputEl = document.querySelector('#output');
const convertBtnEl = document.querySelector('#convert');

const monacoOptions = { language: 'javascript', theme: 'vs', scrollBeyondLastLine: false};
const inputEditor = monaco.editor.create(inputEl, monacoOptions);
const outputEditor = monaco.editor.create(outputEl, monacoOptions);

function convert() {
  !inputEditor.getValue().trim() && inputEditor.setValue(defaultInputTxt.trim());

  const inputTxt = inputEditor.getValue().trim();
  const outputTxt = new Function('codeCustomElement', `a=${inputTxt}; return a;`)(codeCustomElement);
  // const outputTxt = codeCustomElement('my-barcode', options);
  outputEditor.setValue(outputTxt);

  sessionStorage.setItem('inputTxt', inputTxt);
}
convertBtnEl.addEventListener('click', convert);
convert();

