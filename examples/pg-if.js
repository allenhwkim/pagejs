/**
 * <pg-if cond="a === 1"> ..... </pg-if>
 *   will be converted to 
 * <pg-if cond="HASH" cond-value="true"> .....</pg-if>
 *   "cond-value" attribute change will be monitored to decide 
 *   to render contents with saved template or remove all contents
 */

async function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

class PgIf extends HTMLElement {
  static Checks = {
    '<HASH>': {
      func: new Function('return <expression>'),
      value: '<prev-value-from-expression>'
    },
  };
  
  static check() {
    // Run through all PgIf.Checks keys and check if value is changed.
    // If changed,
    //   find all <pg-if cond="HASH"> elements, change value of 'cond-value' value
    //   This causes attributeChanged callback to run
  } 

  connectedCallback() {
    // set PgIf.checks[HASH] from condition
    // set cond attribute from condition
    // set cond-value attribute from condition
    // save the current HTML as template 
    this.render();
  }
  
  static observedAttributes() {
    return ['cond-valuee'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    (oldVal !== newVal) && this.render();
  }

  disconnectedCallback() {
    const hash = this.getAttribute("cond");
    delete PgIf.Checks[hash];
  }

  render() {
    const toRender = this.getAttribute('cond-value') === 'true';
    if (toRender) {
      this.replaceChildren(template.content.cloneNode(true))
    } else {
      this.replaceChildren();
    }
  }
}