import './style.css';
import { initMonacoEditors, initExamples, setExampleAndRun, showGeneratedCode, runCode} from './main-functions';
import { decode } from './page-route'
const $ = document.querySelector.bind(document);

window.fetch('/pages.data?'+new Date().getTime())
  .then(resp => resp.text())
  .then(resp => decode(resp))
  .then(pages => globalThis.pages = pages)

initMonacoEditors();  // initialize monaco editor divs
initExamples();       // set radio buttons for all examples
setExampleAndRun();   // show code and result

$('#show-generated-code').addEventListener('click', () => setTimeout(showGeneratedCode, 300));
$('#run-code').addEventListener('click', runCode);
$('#myform').addEventListener('click', setExampleAndRun);