import postcss  from 'postcss';
import prefixer from 'postcss-prefix-selector';

export function addCss(tagName: string, css: string) {
  tagName = tagName.toLowerCase();
  const plugin =  prefixer({
    prefix: tagName,
    transform(prefix, selector, prefixedSelector, filePath, rule) { 
      return selector.match(/^:host/) ? selector.replace(/:host/, prefix):
        selector.match(new RegExp(`\\s*${tagName}`)) ? selector : `${prefix} ${selector}`;
    },
  });
  const scopedCss = postcss().use(plugin).process(css, {map: false}).css;
  !(document.querySelector(`style[${tagName}]`)) &&
    document.head.insertAdjacentHTML('beforeend', `<style ${tagName}>${scopedCss}</style>`);
}

export function removeCss(tagName: string) { 
  !(document.body.querySelectorAll(tagName).length) &&
  document.head.querySelector(`style[${tagName}]`)?.remove();
}

export function loadScript(...urls) {
  Array.from(urls).forEach(url => {
    if (url.endsWith('.js') && !document.querySelector(`script[src="${url}"]`)) {
      const el = document.createElement('script');
      el.setAttribute('src', url);
      document.head.appendChild(el);
    } else if (url.endsWith('.css') && !document.querySelector(`link[href="${url}"]`)) {
      const el = document.createElement('link');
      el.setAttribute('rel', 'stylesheet');
      el.setAttribute('href', url);
      document.head.appendChild(el);
    }
  })
};

export function waitFor(expr: string, timeout: number = 3000): Promise<any> {
  let waited = 0;
  return new Promise(function(resolve, reject) {
    const func = new Function(`return ${expr}`);
    function waitForCondition() {
      if (func()) {
        resolve(true);
      } else if (waited > timeout) {
        reject(`could not resolve ${expr} in ${timeout}ms.`);
      } else {
        setTimeout(waitForCondition, 300);
        waited += 300;
      }
    }
    waitForCondition();
  });
}

export function fixIndent(code: string) {
  code = code.replace(/^([ \t]*\n+){1,}|[\n\t ]+$/g, ''); // remove empty first/last line
  const firstIndent = (code.match(/^([ ]+)/) || [])[1];
  if (firstIndent) {
    const re = new RegExp(`^${firstIndent}`, 'gm');
    return code.replace(re, '');
  }
  return code;
}


export function debounce(func: Function, wait = 500) {
  let timeout: any;
  return function (this: any, ...args: any) {
    var context = this;
    var later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getReactProp(el: HTMLElement, propName: string) {
  const reactPropKey = Object.keys(el).find( key => key.startsWith('__reactProps$')) // react 17+
  return reactPropKey ? el[reactPropKey][propName] : el[propName];
}