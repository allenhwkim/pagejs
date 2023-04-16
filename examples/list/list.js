import css from './list.css?inline';

export default {
  tagName: 'my-list',
  shadow: true,
  css, 
  observedAttributes: ['selected', 'expanded'],
  constructorCallback() {
    this.host.addEventListener('keydown', e => this.keydownHandler(e));
  },
  render({attrs}) {
    this.init(attrs.expanded === 'true');
    this.initHighlightAndSelect(attrs.selected)
  },
  keydownHandler(event) {
    const ulEl = event.target;
    const highlightedEl = ulEl.querySelector('.x2-highlighted');
    const hasUlEl = highlightedEl.querySelector('ul');

    const highlightNextEl = (ulEl, inc=1) => {
      const allEls = ulEl.querySelectorAll('li');
      const visibles = Array.from(allEls)
        .filter((el) => el.offsetParent !== null);
      const highlightedEl = ulEl.querySelector('.x2-highlighted');
      const curIndex = visibles.indexOf(highlightedEl);
      const nxtIndex = (visibles.length + curIndex + inc) % visibles.length;

      highlightedEl?.classList.remove('x2-highlighted');
      visibles[nxtIndex]?.classList.add('x2-highlighted');
    }

    if (['Enter', 'Space'].includes(event.code)) {
      highlightedEl && hasUlEl && this.toggleAriaExpanded(highlightedEl);
      (event.code === 'Enter') && this.fireSelect(highlightedEl);
    } else if (['ArrowUp', 'ArrowLeft'].includes(event.code)) {
      highlightNextEl(ulEl, -1);
    } else if (['ArrowDown', 'ArrowRight'].includes(event.code)) {
      highlightNextEl(ulEl);
    }
    if (['Enter', 'Space', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.code)) {
      event.stopPropagation();
      event.preventDefault();
    }
  }, 
  init(expanded) {
    const highlightEl = (ulEl, el) => {
      const highlightedEl = ulEl.querySelector('.x2-highlighted');
      highlightedEl && highlightedEl.classList.remove('x2-highlighted');
      el.classList.add('x2-highlighted');
    }

    const ulEl = this.host.querySelector('ul');
    ulEl.setAttribute('tabindex', '0');
    ulEl.querySelectorAll('li > ul, li > * > ul').forEach(el => {
      const liEl = el.closest('li');
      liEl.parentElement.setAttribute('aria-has-popup','');
      expanded && liEl.setAttribute('aria-expanded', '');
    });
    ulEl.querySelectorAll('li').forEach(el => {
      el.addEventListener('click', (event) => {
        const liEl = event.target.closest('li');
        const hasUlEl = liEl.querySelector('ul');
        hasUlEl ? this.toggleAriaExpanded(liEl) : this.fireSelect(liEl);
        highlightEl(ulEl, liEl);
        event.stopPropagation();
      });
    });
  },
  initHighlightAndSelect(selected) {
    const ulEl = this.host.querySelector('ul');
    const liEl = ulEl.querySelector('#'+ selected || 'unknown');
    if (liEl) {
      liEl.classList.add('x2-highlighted');
      let expandable = liEl.parentElement.closest('li:has(ul)');
      while(expandable && ulEl.contains(expandable)) { 
        expandable.setAttribute('aria-expanded', '');
        expandable = expandable.parentElement.closest('li:has(ul)');
      }
      this.fireSelect(ulEl.querySelector('.x2-highlighted'));
    }
  },
  toggleAriaExpanded(el) {
    const expanded = el.getAttribute('aria-expanded') !== null;
    if (expanded) {
      el.removeAttribute('aria-expanded');
    } else {
      el.setAttribute('aria-expanded', '');
    }
  },
  fireSelect(el) {
    // unselect prev highlighted ones, and highlight and fire event
    const ulEl = el.closest('ul');
    const highlightedEl = ulEl.querySelector('.x2-highlighted');
    highlightedEl && highlightedEl.classList.remove('x2-highlighted');
    if (el && (el.offsetParent !== null)) { // if visible
      el.classList.add('x2-highlighted');
      el.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: el }));
    }
  }
};




