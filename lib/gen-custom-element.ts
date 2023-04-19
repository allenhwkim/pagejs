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
    'props', 'css', 'tagName',
    'constructorCallback', 'observedAttributes', 'adoptedCallback', 
    'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 
  ];

  const libImports: string[] = [];
  if (imports) {
    libImports.push('loadScript', 'waitFor', 'addCss', 'removeCss');
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

      constructor() { 
        super();${
          Object.keys(opts)
            .filter(key => reservedProps.indexOf(key) === -1)
            .filter(key => typeof opts[key] !== 'function')
            .map( key => {
              return `this.${key} = ${JSON.stringify(opts[key])};`;
            }).join('\n\n')
        }${!opts.props ? '' :`
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
        `}${ opts.shadow ? `
          this.host = this.attachShadow({ mode: 'open'});
          const template = document.createElement('template')
          template.innerHTML = this.innerHTML;
          this.host.appendChild(template.content.cloneNode(true));
        `: `this.host = this;`
        }${ getFuncBody(opts.constructorCallback) } 
      }
    
      async connectedCallback() {
        if (!this.isConnected) return; ///  connected(directly or indirectly) to DOM
        ${opts.css && !opts.shadow ? `addCss(this.tagName, css);`: ''}
        ${opts.css && opts.shadow ? `
          const styleEl = document.createElement('style');
          styleEl.textContent = css;
          this.host.appendChild(styleEl);
        `: ''}${ 
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
        // called when attribute/props changes and connectedCallback
        #timer;
        #updateDOM(caller) { 
          clearTimeout(this.#timer);
          // run as debounced since it's called from many places and often
          this.#timer = setTimeout(async () => { 
            ${typeof opts.render !== 'function' ? '' : `
              const param =  {attrs: this.attrs, props: this['props']};
              const newHTML = await this.render(param);
              if (typeof newHTML === 'string') {
                const updated = document.createElement('div');
                ${opts.css && opts.shadow ? `updated.innerHTML += \`<style>${opts.css}</style>\`;`:''}
                updated.innerHTML += newHTML;
                morphdom( this.host /*fromNode*/, updated /*toNode*/, { childrenOnly: true }); 
              }
            `}
          }, 50);
        }
      `}
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