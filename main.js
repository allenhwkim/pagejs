import './style.css';
import { initMonacoEditors, initExamples, setExampleAndRun, showGeneratedCode, runCode} from './main-functions';

const $ = document.querySelector.bind(document);

initMonacoEditors();  // initialize monaco editor divs
initExamples();       // set radio buttons for all examples
setExampleAndRun();   // show code and result

$('#show-generated-code').addEventListener('click', () => setTimeout(showGeneratedCode, 300));
$('#run-code').addEventListener('click', runCode);
$('#myform').addEventListener('click', setExampleAndRun);
