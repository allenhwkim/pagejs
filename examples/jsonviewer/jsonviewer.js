export default {
  tagName: 'my-jsonviewer',
  css: `
    ul.format-json ul { border-left: 1px dashed black; padding-left: 2rem;  margin-left: -12px;}
    ul.format-json li { cursor: initial; }
    ul.format-json li:has(> ul.hidden) { list-style: '⊞ ' }
    ul.format-json li:has(> ul) { list-style: '⊟ '; cursor: pointer; }
    ul.format-json li:has(> ul) sup { display: none; }
    ul.format-json li:has(> ul.hidden) sup { display: initial; opacity: .8; }
    ul.format-json.hidden { display: none; }
  `,
  observedAttributes: ['level'],
  props : { data: {} },
  render() {
    this.writeDOM(this, this.data);
  },
  writeDOM(el, data, level=0) {
    const ul = document.createElement('ul');
    ul.classList.add('format-json');
    (level >= this.attrs.level) && (ul.classList.add('hidden'));

    if (typeof data === 'object') { // array is an object
      for (var key in data) {
        const item = document.createElement('li');
        const li = ul.appendChild(item);
        const values = Object.values(data[key]).filter(el => typeof el == 'string').join(' / ');
        li.innerHTML = `${key} <sup>${values}</sup>`;

        const toggleList = function(event) {
          const child = event.target.querySelector('ul');
          const action = child?.classList.contains('hidden') ? 'remove' : 'add';
          action && child?.classList[action]('hidden');
          event.stopPropagation();
        }

        li.addEventListener('click', toggleList);
        el.appendChild(ul);

        (typeof data[key] === 'object') ? 
          this.writeDOM(li, data[key], ++level) : (item.innerHTML = `${key}: ${data[key]}`);
      }
    }
  }
}