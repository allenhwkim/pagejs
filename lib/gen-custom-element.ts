import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

export function genCustomElement( opts: {[key:string]: any}, imports: boolean = true) {
  const klassName = (opts.tagName || 'my-custom-element')
    .replace(/^[a-z]/, m => m.toUpperCase())
    .replace(/-([a-z])/g, (m, w) => w.toUpperCase());

  const getFuncBody = (func: Function) => {
    if (typeof func !== 'function') return '';
    return func.toString().replace(/^\S+\(\)\s\{/, '').replace(/}$/,'');
  }

  const reservedProps = [
    'props', 'css', 'resolve', 'tagName',
    'constructorCallback', 'observedAttributes', 'adoptedCallback', 
    'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 
  ];

  const libImports: string[] = [];
  if (imports) {
    opts.resolve?.toString().indexOf('loadScript(') && libImports.push('loadScript');
    opts.resolve?.toString().indexOf('waitFor(') && libImports.push('waitFor');
    opts.css && libImports.push('addCss', 'removeCss');
  }

  const shouldUpdateDom = opts.observedAttributes || opts.render || opts.props;

  const str = /*javascript*/ `
    ${imports ?  `import morphdom from 'morphdom/dist/morphdom-esm';` : ''}
    ${imports && libImports.length ? `import {${libImports.join(', ')}} from './lib';` : ''}
    ${opts.css ? 'const css = \`' + opts.css + '\`;' : ''}

    class ${klassName} extends HTMLElement {
      get attrs() { 
        return [...this.attributes]
          .reduce( (acc, attr) => {
            const attrVar = attr.name.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
            const attrVal = !isNaN(attr.value) ? +attr.value : attr.value;
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
        ${
          Object.keys(opts)
            .filter(key => reservedProps.indexOf(key) === -1)
            .filter(key => typeof opts[key] !== 'function')
            .map( key => {
              return `this.${key} = ${JSON.stringify(opts[key])}`;
            }).join('\n\n')
        }

        ${!opts.props ? '' :`
          this['props'] = {
            ${ 
              Object.keys(opts.props)
                .map(key => {
                  const propVal = opts.props[key];
                  const val = typeof propVal === 'function' ? propVal : JSON.stringify(propVal);
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

        ${ getFuncBody(opts.constructorCallback) } 
      }
    
      async connectedCallback() { // called after the element is attached to the DOM.
        if (!this.isConnected) return; ///  connected(directly or indirectly) to DOM
        ${opts.css ? `addCss(this.tagName, css);`: ''}

        ${
          typeof opts.resolve === 'function' ? `await this.resolve();` : ''
        }${ 
          getFuncBody(opts.connectedCallback) 
        }${ !shouldUpdateDom ? '' : ` 
          this.#updateDOM.call(this, 'connectedCallback');
        `}
      }

      ${ !(opts.disconnectedCallback || opts.css) ? '': `
        disconnectedCallback() {
          ${ getFuncBody(opts.disconnectedCallback) } 
          ${ opts.css ? `removeCss(this.tagName);` : ''}
        }`
      }

      ${ !opts.observedAttributes ? '' : `
        async attributeChangedCallback(name, oldValue, newValue) {
          if (oldValue !== newValue) {
            ${
              typeof opts.resolve === 'function' ? 'await this.resolve();' : '' 
            }${ 
              getFuncBody(opts.attributeChangedCallback) 
            }${ !shouldUpdateDom ? '' : ` 
              this.#updateDOM.call(this, 'attributeChangedCallback');
            `}
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

      ${ !shouldUpdateDom ? '' : `
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
      `}
      }

    }

    ${!opts.tagName ? '': `
      (!customElements.get('${opts.tagName}')) 
        && customElements.define('${opts.tagName}', ${klassName});
    `}
  `;

  return prettier.format(str, {
    parser: 'babel',
    plugins: [parserBabel], 
    singleQuote: true
  });
}