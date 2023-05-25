import morphdom from 'morphdom/dist/morphdom-esm';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { customElement, loadScript, waitFor, addCss, removeCss, fixIndent, debounce, getReactProp, TouchSwipe } from "./lib";
import { genCustomElement } from "./lib/gen-custom-element";
import examples from './examples';

// initialize all monaco editors
export function initMonacoEditors() {
  const $ = document.querySelector.bind(document);
  const proxy = URL.createObjectURL(new Blob([`
    self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@latest/min/' };
    importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
  `], { type: 'text/javascript' }));
  globalThis.MonacoEnvironment = { getWorkerUrl: () => proxy };

  const monacoOptions = { 
    language: 'javascript', 
    scrollBeyondLastLine: false, 
    minimap: {enabled: false}, 
    tabSize: 2,
  };
  monaco.editor.create($('#monaco-input'), monacoOptions);
  monaco.editor.create($('#monaco-output'), monacoOptions);
  monaco.editor.create($('#monaco-html-editor'), {...monacoOptions, language: 'html'});
}

// initialize example list and add html editor change listener
export function initExamples() {
  const $ = document.querySelector.bind(document);
  const sessionExample = sessionStorage.getItem('example') || 'barcode';
  for (var key in examples) {
    const checked = key === sessionExample ? 'checked' : '';
    (document as any).myform.insertAdjacentHTML(
      'beforeend',
      `<label><input type="radio" name="example" value="${key}" ${checked}/> ${key}</label>`
    );
  }
  const htmlEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-html-editor');
  htmlEditor.onDidBlurEditorWidget(function () {
    if ((document as any).myform.out.value !== htmlEditor.getValue()) { // only apply if different from org.
      $('#output-section').innerHTML = htmlEditor.getValue();
    }
  });
}

// set code for input editor and run selected
export function setExampleAndRun() {
  const key = (document as any).myform.example.value;
  if (examples[key]) {
    sessionStorage.setItem('example', key);

    const inputCode = fixIndent(
      `import {customElement} from 'pagejs';\n\n` +
      `customElement(${examples[key].in})`
    );
    const inputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-input');
    inputEditor.setValue(inputCode);

    (document as any).myform.in.value = examples[key].in; 
    (document as any).myform.out.value = examples[key].out; 
    (document as any).myform.css.value = examples[key].css || null; 
    runCode();
  } else {
    sessionStorage.removeItem('example');
    console.error('error: cannot find an example to run', key);
  }
}

// returns options object from js text
export function getOptions(inputTxt) { // returns customElement(..) options
  const css = (document as any).myform.css.value;

  const matches = inputTxt.trim().match(/^.*?CustomElement\(([\s\S]+)\);?$/im);
  if (matches) {
    const optionsTxt = matches[1];
    // const options = new Function('loadScript', 'css', `a=${optionsTxt}; return a;`)(loadScript, css);
    const options = new Function(
      'loadScript',
      'waitFor',
      'addCss',
      'removeCss', 
      'fixIndent',
      'debounce',
      'getReactProp',
      'morphdom',
      'TouchSwipe',
      'css',
      `a= ${optionsTxt}; return a;`
    )(loadScript, waitFor, addCss, removeCss, fixIndent, debounce, getReactProp, morphdom, TouchSwipe, css);
    return options;
  }
}

// returns vanilla js custom element code from customElement(...) text
export function getGeneratedCode(inputTxt) { // returns generated code 
  const options = getOptions(inputTxt);
  return options && genCustomElement(options, true /* imports */);
}

// read input editor value, then set output editor value with generated code 
export function showGeneratedCode() {
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

// read input editor value, then update html editor and output section from its value
export function runCode() {
  const $ = document.querySelector.bind(document);
  const inputEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-input');
  const htmlEditor = monaco.editor.getEditors().find(el => el._domElement.id === 'monaco-html-editor');

  const options = getOptions(inputEditor.getValue());
  const orgValue = `import {customElement} from 'pagejs';\n\n` +
    `customElement(${(document as any).myform.in.value})`;
  const srcChanged =  orgValue !== inputEditor.getValue();
  options.tagName ||=  'my-custom-element';

  // source changed, but using the same tag name(alreay defined)
  if (customElements.get(options.tagName) && srcChanged) {
    alert(`error, source code changed, but it's using the already defined tag name. please use a new tag name`);
    return;
  } 
  // invalid source code to run
  else if (!options) {
    alert('Invalid source. It must be wrapped with customElement() function');
    return;
  }

  // define custom element
  customElement(options); 
  // Change all tag names to options.tagName, so that it runs with a new tagName
  const newHTML = (document as any).myform.out.value
    .replace(/<[a-z]+-[a-z-]+/g, '<'+options.tagName)
    .replace(/[a-z]+-[a-z-]+>/g, options.tagName + '>')

  htmlEditor.setValue(newHTML);
  htmlEditor.layout();

  // create a temp el., insert script tag first, then insert other tags
  $('#output-section').innerHTML = ''; 
  const divEl:any = document.createElement('div');
  divEl.innerHTML = htmlEditor.getValue();
  divEl.querySelectorAll("script").forEach((scriptEl:any) => {
    const newEl = document.createElement("script");
    [...scriptEl.attributes].forEach(attr => newEl.setAttribute(attr.name, attr.value));
    newEl.appendChild(document.createTextNode(scriptEl.innerHTML));
    $('#output-section').appendChild(newEl, scriptEl); // insert all script tags first
    newEl.remove();
  });
  [...divEl.children].forEach(el => $('#output-section').appendChild(el));
}