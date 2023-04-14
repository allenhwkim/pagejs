import morphdom from 'morphdom/dist/morphdom-esm';
import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';

function loadScript(...urls) {
  Array.from(urls).forEach((url) => {
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
  });
}

function waitFor(expr, timeout = 3e3) {
  let waited = 0;
  return new Promise(function (resolve, reject) {
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

function addCss(tagName, css) {
  const plugin = prefixer({
    prefix: tagName,
    transform(prefix, selector, prefixedSelector, filePath, rule) {
      return selector.match(/^:host/)
        ? selector.replace(/:host/, prefix)
        : `${prefix} ${selector}`;
    },
  });
  const scopedCss = postcss().use(plugin).process(css).css;
  !document.querySelector(`style[${tagName}]`) &&
    document.head.insertAdjacentHTML(
      'beforeend',
      `<style ${tagName}>${scopedCss}</style>`
    );
}

function removeCss(tagName) {
  !document.body.querySelectorAll(tagName).length &&
    document.head.querySelector(`style[${tagName}]`)?.remove();
}

const css = 'hello {background: #ccc;}';

class MyBarcode extends HTMLElement {
  get attrs() {
    return [...this.attributes].reduce((acc, attr) => {
      const attrVar = attr.name.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
      const attrVal = attr.value.match(/^d+$/) ? +attr.value : attr.value;
      return { ...acc, [attrVar]: attrVal };
    }, {});
  }

  static get observedAttributes() {
    return ['value', 'format'];
  }

  async resolve() {
    loadScript('//unpkg.com/jsbarcode/dist/JsBarcode.all.min.js');
    await waitFor('window.JsBarcode');
  }

  constructor() {
    // called when the element is created.
    super();

    this['props'] = {
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
    };

    for (let key in this['props']) {
      //  getter and setters of all reactive props
      Object.defineProperty(this, key, {
        get() {
          return this['props'][key];
        },
        set(value) {
          if (this['props'][key] === value) return;
          this['props'][key] = value;
          this.#updateDOM.call(this, 'prop-setter'); // react to props change
        },
      });
    }

    addCss('my-barcode', css);
  }

  async connectedCallback() {
    // called after the element is attached to the DOM.
    if (!this.isConnected) return; ///  connected(directly or indirectly) to DOM

    await this.resolve();
    this.innerHTML = '<svg></svg>';
    this.#updateDOM.call(this, 'connectedCallback');
  }

  disconnectedCallback() {
    removeCss('my-barcode');
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      await this.resolve();
      this.#updateDOM.call(this, 'attributeChangedCallback');
    }
  }

  render({ attrs, props }) {
    const value = attrs.value || '123456789012';
    const format = attrs.format || 'code128';
    window['JsBarcode'](this.firstChild, value, { ...props, format });
  }

  #timer;
  #updateDOM(caller) {
    // called when attribute/props changes and connectedCallback
    clearTimeout(this.#timer);
    this.#timer = setTimeout(async () => {
      // run as debounced since it's called from many places

      const param = { attrs: this.attrs, props: this['props'] };
      const newHTML = await this.render(param); // render() may not change DOM
      if (newHTML !== undefined) {
        const updated = document.createElement('div');
        updated.innerHTML = await newHTML;
        morphdom(this /*fromNode*/, updated /*toNode*/, { childrenOnly: true });
      }
    }, 100);
  }
}

if (!customElements.get('my-barcode')) {
  customElements.define('my-barcode', MyBarcode);
}
