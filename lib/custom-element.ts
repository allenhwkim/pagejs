import morphdom from 'morphdom/dist/morphdom-esm';
import { genCustomElement } from "./gen-custom-element";
import { loadScript, waitFor, addCss, removeCss, fixIndent, debounce, getReactProp } from "./util";

export function customElement( opts: {[key:string]: any}, imports: boolean = true) {
  const generated = genCustomElement(opts, false);
  new Function(
    'loadScript',
    'waitFor',
    'addCss',
    'removeCss', 
    'fixIndent',
    'debounce',
    'getReactProp',
    'morphdom',
    `${generated}`
  )(loadScript, waitFor, addCss, removeCss, fixIndent, debounce, getReactProp, morphdom);
}