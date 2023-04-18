import { TouchSwipe } from '../../lib';
import css from './resize-divs.css?inline';

export default {
  touchStart: undefined,
  css,
  constructorCallback() {
    document.addEventListener('x-swipe', this.resizeListener);
  },
  connectedCallback() {
    // insert touch listening <div class="resize-bar"> between each element
    Array.from(this.children).slice(0, -1).forEach(el => {
      const resizeBarEl = document.createElement('div');
      resizeBarEl.classList.add('resize-bar');
      new TouchSwipe(resizeBarEl);
      el.insertAdjacentElement('afterend', resizeBarEl);
    })
  },
  resizeListener(event) {
    const {type, touchStaEl, x0, y0, x2, y2} = event.detail;
    const prevEl = touchStaEl.previousElementSibling;
    const nextEl = touchStaEl.nextElementSibling;
    if (touchStaEl.parentElement !== this) return;

    if (type === 'start') {
      touchStaEl.classList.add('active');
      this.touchStart = {
        prevElW: prevEl.offsetWidth, 
        prevElH: prevEl.offsetHeight,
        nextElW: nextEl.offsetWidth, 
        nextElH: nextEl.offsetHeight,
      }
      this.dispatchEvent(new CustomEvent('resize-start', {bubbles: true}));
    } else if (type === 'move') {
      if (this.getAttribute('width') !== null) {
        prevEl.style.width = Math.max(this.touchStart.prevElW + (x2 - x0), 20) + 'px';
        nextEl.style.width = Math.max(this.touchStart.nextElW - (x2 - x0), 20) + 'px';
      } else if (this.getAttribute('height') !== null) {
        prevEl.style.height = Math.max(this.touchStart.prevElH + (y2 - y0), 20) + 'px';
        nextEl.style.height = Math.max(this.touchStart.nextElH - (y2 - y0), 20) + 'px';
      }
      this.dispatchEvent(new CustomEvent('resize-move', {bubbles: true}));
    } else if (type === 'end') {
      touchStaEl.classList.remove('active');
      this.dispatchEvent(new CustomEvent('resize-end', {bubbles: true}));
    } 
  },
  disconnectedCallback() {
    document.removeEventListener('x-swipe', this.resizeListener);
  }
}