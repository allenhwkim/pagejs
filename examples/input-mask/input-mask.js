import css from './input-mask.css?inline';

export default {
  tagName: 'input-mask',
  shadow: true,
  css,
  observedAttributes: ['mask'],
  MASK_EXPR: {
    Y: '[0-9]', 
    M: '[0-9]', 
    D: '[0-9]',
    9: '[0-9]', 
    '#': '[0-9]',
    X: '[a-zA-Z0-9]',
    A: '[a-zA-Z]',
    _: '[0-9]'
  }, 

  format(value, mask) {
    let formatted = '';
    const valueArr = value.replace(/[^a-zA-Z0-9]/g, '').split('');
    const maskArr = (''+mask).split('');

    let maskChar = maskArr.shift();
    while(maskChar) {
      const maskExpr = this.MASK_EXPR[maskChar.toUpperCase()];

      if (valueArr[0]) {
        if (maskExpr) {
          const reStr = `^${maskExpr}$`; // e.g. `^[0-9]$`;
          if (valueArr[0].match(new RegExp(reStr))) {
            formatted += valueArr.shift();
          }
        } else {
          formatted += maskChar;
        }
      } else {
        break;
      }

      if (!valueArr[0]) break;
      maskChar = maskArr.shift();
    }

    maskChar = maskArr.shift();
    while(maskChar) {
      const maskExpr = this.MASK_EXPR[maskChar.toUpperCase()];
      if (maskExpr) {
        break;
      } else {
        formatted += maskChar;
      }
      maskChar = maskArr.shift();
    }

    return formatted;
  },

  constructorCallback() {
    const inputEl = this.host.querySelector('input');
    console.log('this.attrs', this.attrs)
    this.attrs.mask = this.attrs.mask || 'yyyy-mm-dd';
    if (!inputEl) {
      this.host.innerHTML = 'error: requires <input> element';
      return;
    }
    inputEl.insertAdjacentElement('afterend', document.createElement('div'));

    inputEl.addEventListener('keydown', this.handleKeyDown.bind(this)); // determint to accept char input or not
    inputEl.addEventListener('input', this.setMaskElText.bind(this)); // change maskEl display
    inputEl.addEventListener('paste',this.handlePaste.bind(this));
  },

  render({attrs}) {
    const inputEl = this.host.querySelector('input');
    const maskEl =  this.host.querySelector('input + div');
    const inputElStyle = getComputedStyle(inputEl);

    maskEl.classList.add('mask');
    maskEl.style.fontSize    = inputElStyle.fontSize;
    maskEl.style.paddingLeft = inputElStyle.paddingLeft;
    maskEl.style.borderWidth = inputElStyle.borderWidth; // border color is transparent
    maskEl.style.whiteSpace = 'pre';
    maskEl.innerText = attrs.mask;

    inputEl.value = this.format(inputEl.value, attrs.mask);
    this.setMaskElText(); // update mask el text by value of input el
  },

  setMaskElText() {
    const inputEl = this.host.querySelector('input');
    const maskEl =  this.host.querySelector('input + div');
    maskEl.innerText = 
      ' '.repeat(inputEl.value.length) +
      (''+this.attrs.mask).substring(inputEl.value.length);
  },
  
  addNextMask() {
    const inputEl = this.host.querySelector('input');
    const maskArr = (''+this.attrs.mask).split('');

    setTimeout( () => { // to handle keydown and input event, this performs after input event
      const inputValLen = inputEl.value.length;
      for (let i = inputValLen; i < maskArr.length; i++) {
        const nextMask = maskArr[i];
        if (!(nextMask && !this.MASK_EXPR[nextMask.toUpperCase()])) { break; }
        inputEl.value += nextMask;
      }
    });
  },

  handlePaste(event) {
    const inputEl = this.host.querySelector('input');

    inputEl.value = this.format(event.clipboardData.getData('text'), this.attrs.mask);
    this.setMaskElText();
    event.preventDefault(); // not to fire another input event
  },

  handleKeyDown(event) {
    const inputEl = this.host.querySelector('input');
    const inputChar = event.key;
    const matchingMask = (''+this.attrs.mask).split('')[inputEl.value.length];

    const isCharInput = inputChar.match(/^\S$/);
    if (isCharInput && !matchingMask) {
      event.preventDefault(); // when too many input, ignore input
    } else if (isCharInput && (event.metaKey || event.ctrlKey)) { // allow copy/paste
      // console.log('.............. meta keydown', event)
    } else if (isCharInput) { // character input
      const reStr = `^${this.MASK_EXPR[matchingMask.toUpperCase()]}$`; // e.g. `^[0-9]$`;
      const isCharAcceptable = inputChar.match(new RegExp(reStr));
      if (isCharAcceptable) {
        this.addNextMask(); //  // if next mask needed, add to input value
      } else {
        event.preventDefault(); // ignore input
      }
    } else { // for special char. e.g. backspace key
      // console.log('space char', {event, inputChar});
    }
  }
}
