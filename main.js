import './style.css';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { genCustomElement, customElement, fixIndent } from './lib';
import examples from './examples';

const $ = document.querySelector.bind(document);

const proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@latest/min/' };
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

const monacoOptions = { language: 'javascript', scrollBeyondLastLine: false, minimap: {enabled: false}};
monaco.editor.create($('#monaco-input'), monacoOptions);
monaco.editor.create($('#monaco-output'), monacoOptions);
monaco.editor.create($('#monaco-html-editor'), {...monacoOptions, language: 'html'});

initExamples(); // set radio buttons for all examples
setExample();   // show code and result

$('#show-generated-code').addEventListener('click', () => setTimeout(showGeneratedCode, 300));
$('#run-code').addEventListener('click', runCode);
$('#myform').addEventListener('click', setExample);

function setExample() {
  const key = document.myform.example.value;

  const inputCode = fixIndent(`customElement(${examples[key].in})`);
  const inputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-input');
  inputEditor.setValue(inputCode);


  document.myform.in.value = examples[key].in; 
  document.myform.out.value = examples[key].out; 
  document.myform.css.value = examples[key].css || null; 
  sessionStorage.setItem('example', key);
  
  runCode();
}

function initExamples() {
  const sessionExample = sessionStorage.getItem('example') || 'barcode';
  for (var key in examples) {
    const checked = key === sessionExample ? 'checked' : '';
    document.myform.insertAdjacentHTML(
      'beforeend',
      ` <input type="radio" name="example" value="${key}" ${checked}/> ${key}`
    );
  }
  const htmlEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-html-editor');
  htmlEditor.onDidBlurEditorWidget(function () {
    if (document.myform.out.value !== htmlEditor.getValue()) { // only apply if different from org.
      $('#output-section').innerHTML = htmlEditor.getValue();
    }
  });
}

function getOptions(inputTxt) { // returns customElement(..) options
  const css = document.myform.css.value;

  const matches = inputTxt.trim().match(/^.*?CustomElement\(([\s\S]+)\);?$/i);
  if (matches) {
    const optionsTxt = matches[1];
    const options = new Function('css', `a=${optionsTxt}; return a;`)(css);
    return options;
  }
}

function getGeneratedCode(inputTxt) { // returns generated code 
  const options = getOptions(inputTxt);
  return options && genCustomElement(options, true /* imports */);
}

function showGeneratedCode() {
  const inputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-input');
  const outputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-output');
  const inputTxt = inputEditor.getValue();
  const generated = getGeneratedCode(inputTxt);
  if (generated) {
    outputEditor.setValue(generated);
    sessionStorage.setItem('inputTxt', inputTxt);
  } else {
    const message = '// Invalid source code. It must be wrapped with customElement() function.'
    outputEditor.setValue(message);
  }
  outputEditor.layout();
}

function runCode() {
  const inputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-input');
  const options = getOptions(inputEditor.getValue());
  if (options) {
    options.tagName ||=  'my-custom-element';
    customElement(options, false); // define custom element

    $('#output-section').innerHTML = document.myform.out.value;
    const htmlEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-html-editor');
    htmlEditor.setValue(document.myform.out.value);
    htmlEditor.layout();
  } else {
    alert('Invalid source. It must be wrapped with customElement() function');
  }
}