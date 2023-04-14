import postcss  from 'postcss';
import prefixer from 'postcss-prefix-selector';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

export function addCss(tagName: string, css: string) {
  const plugin =  prefixer({
    prefix: tagName,
    transform(prefix, selector, prefixedSelector, filePath, rule) { 
      return selector.match(/^:host/) ? selector.replace(/:host/, prefix): `${prefix} ${selector}`;
    },
  });
  const scopedCss = postcss().use(plugin).process(css).css;
  !(document.querySelector(`style[${tagName}]`)) &&
    document.head.insertAdjacentHTML('beforeend', `<style ${tagName}>${scopedCss}</style>`);
}

export function removeCss(tagName: string) { 
  !(document.body.querySelectorAll(tagName).length) &&
  document.head.querySelector(`style[${tagName}]`)?.remove();
}

export function loadScript(...urls) {
  Array.from(urls).forEach(url => {
    if (url.endsWith('.js')) {
      const el = document.createElement('script');
      el.setAttribute('src', url);
      document.head.appendChild(el);
    } else if (url.endsWith('.css')) {
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

export function codeCustomElement(tagName:string, opts: {[key:string]: any}, includes = {imports: true, functions: true}) {
  const klassName = tagName.replace(/^[a-z]/, m => m.toUpperCase())
    .replace(/-([a-z])/g, (m, w) => w.toUpperCase());

  const getFuncBody = (func: Function) => {
    if (typeof func !== 'function') return '';
    return func.toString().replace(/^\S+\(\)\s\{/, '').replace(/}$/,'');
  }

  const reservedProps = [
    'props', 'css', 'resolve',
    'constructorCallback', 'observedAttributes',
    'connectedCallback', 'disconnectedCallback', 
    'adoptedCallback', 'attributeChangedCallback', 
  ];

  const str = /*javascript*/ `
    ${includes.imports ?  `import morphdom from 'morphdom/dist/morphdom-esm';` : ''}
    ${includes.imports && opts.css ? `import postcss  from 'postcss';`: '' }
    ${includes.imports && opts.css ? `import prefixer from 'postcss-prefix-selector';` : '' }

    ${includes.functions && opts.resolve?.toString().indexOf('loadScript(') ? loadScript : ''}\n
    ${includes.functions && opts.resolve?.toString().indexOf('waitFor(') ? waitFor : ''}\n
    ${includes.functions && opts.css ? addCss : ''}\n
    ${includes.functions && opts.css ? removeCss : ''}\n
    ${includes.functions && opts.css ? 'const css = \'' + opts.css + '\';' : ''}

    class ${klassName} extends HTMLElement {
      get attrs() { 
        return [...this.attributes]
          .reduce( (acc, attr) => {
            const attrVar = attr.name.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
            const attrVal = attr.value.match(/^\d+$/) ? +attr.value : attr.value;
            return { ...acc, [attrVar]: attrVal };
          }, {})
      }

      ${ !opts.observedAttributes ? '':`
        static get observedAttributes() {
          return [${opts.observedAttributes.map(el => `'${el}'`).join(', ')}];
        }`
      }

      ${ typeof opts.resolve === 'function' ? opts.resolve: '' } 

      constructor() {  // called when the element is created.
        super();

        ${!opts.props ? '' :`
          this['props'] = {
            ${ 
              Object.keys(opts.props)
                .map(key => {
                  const val = typeof opts.props[key] === 'string' ? `'${opts.props[key]}'`: opts.props[key];
                  return `${key}: ${val}`;
                }).join(',\n')
            }
          };

          for (let key in this['props']) {  //  getter and setters of all reactive props
            Object.defineProperty(this, key, {
              get() { return this['props'][key]; },
              set(value) {
                if (this['props'][key] === value) return;
                this['props'][key] = value;
                this.#updateDOM.call(this, 'prop-setter'); // react to props change
              }
            });
          }
        `}

        ${opts.css ? `addCss('${tagName}', css);`: ''}
        ${ getFuncBody(opts.constructorCallback) } 
      }
    
      async connectedCallback() { // called after the element is attached to the DOM.
        if (!this.isConnected) return; ///  connected(directly or indirectly) to DOM

        ${
          typeof opts.resolve === 'function' ? `await this.resolve();` : ''
        }${ 
          getFuncBody(opts.connectedCallback) 
        }this.#updateDOM.call(this, 'connectedCallback');
      }

      ${ !(opts.disconnectedCallback || opts.css) ? '': `
        disconnectedCallback() {
          ${ getFuncBody(opts.disconnectedCallback) } 
          ${ opts.css ? `removeCss('${tagName}');` : ''}
        }`
      }

      ${ !opts.observedAttributes ? '' : `
        async attributeChangedCallback(name, oldValue, newValue) {
          if (oldValue !== newValue) {
            ${
              typeof opts.resolve === 'function' ? 'await this.resolve();' : '' 
            }${ 
              getFuncBody(opts.attributeChangedCallback) 
            }this.#updateDOM.call(this, 'attributeChangedCallback');
          }
        }`
      }

      ${typeof opts.adoptedCallback !== 'function' ? '' : ` 
        adoptedCallback() { ${ getFuncBody(opts.adoptedCallback) } }
        `
      }

      ${
        Object.keys(opts)
          .filter(key => reservedProps.indexOf(key) === -1)
          .filter(key => typeof opts[key] === 'function')
          .map( key => {
            return opts[key].toString().replace(/^function/, key)
          }).join('\n\n')
          
      }

      #timer;
      #updateDOM(caller) { // called when attribute/props changes and connectedCallback
        clearTimeout(this.#timer);
        this.#timer = setTimeout(async () => { // run as debounced since it's called from many places
          ${typeof opts.render !== 'function' ? '' : `
            const param =  {attrs: this.attrs, props: this['props']};
            const newHTML = await this.render(param); // render() may not change DOM
            if (newHTML !== undefined) { 
              const updated = document.createElement('div')
              updated.innerHTML = await newHTML;
              morphdom( this /*fromNode*/, updated /*toNode*/, { childrenOnly: true }); 
            }
          `}
       }, 100);
      }

    }

    if (!customElements.get('${tagName}')) {
      customElements.define('${tagName}', ${klassName})
    }
  `;

  return prettier.format(str, {
    parser: 'babel',
    plugins: [parserBabel], 
    singleQuote: true
  });
}