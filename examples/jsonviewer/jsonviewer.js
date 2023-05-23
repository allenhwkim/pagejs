export default {
  tagName: 'my-jsonviewer',
  css: `
    ul.format-json li { cursor: initial; }
    ul.format-json li:has(> ul.hidden) { list-style: '+ ' }
    ul.format-json li:has(> ul) { list-style: '- '; cursor: pointer; }
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
        li.innerHTML = `${key}`;

        li.addEventListener('click', e => {
          const child = e.target.firstElementChild;
          const action = child?.classList.contains('hidden') ? 'remove' : 'add';
          action && child?.classList[action]('hidden');
          e.stopPropagation();
        })
        el.appendChild(ul);

        (typeof data[key] === 'object') ? 
          this.writeDOM(li, data[key], ++level) : (item.innerHTML = `${key}: ${data[key]}`);
      }
    }
  }
}