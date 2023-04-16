import css from './file.css?inline';

export default {
  tagName: 'my-file',
  shadow: true,
  css, 
  observedAttribures: ['message'],
  props: {
    files: [], // when changed, renders html
  },
  files: [],
  render({attrs, props}) {
    const formatSize = (bytes, decimalPoint = 2) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1000));
      return parseFloat((bytes / Math.pow(1000, i))
        .toFixed(decimalPoint)) + ' ' + sizes[i];
    };
    const message = attrs.message || 
      'Click, copy/paste files, or drag/drop files here. The selected files are displayed below.';

    return `
      <label class="x-file-input">
        <input type="file" multiple />
        <div class="x-slot">${message}</div>
      </label>
      <div class="x-file-list">${props.files.map( (file, ndx) => {
        return `
          <div class="x-file" id="file-${ndx}">
            <div class="x-name">${file.name}</div>
            <div class="x-preview">${
              file.type.match(/^image/) ?
                `<img class="x-preview" src="${file.dataURL}" />` :
                `<span>${file.type}</span>`}(${formatSize(file.size)
              })
            </div>
            <div class="x-buttons">
              <button class="x-delete" data-id="${ndx}">🗑</button>
            </div>
            <div class="x-progress"></div>
          </div>`.trim();
      }).join('\n')}</div>`;
  },
  connectedCallback() {
    this.message = this.host.innerHTML.trim() || this.message; // save user's message

    this.host.addEventListener('dragover', this.dragoverHandler.bind(this));
    this.host.addEventListener('dragleave', this.dragleaveHandler.bind(this));
    this.host.addEventListener('change', this.setFiles.bind(this)); 
    this.host.addEventListener('drop', (evt) => {
      this.dragleaveHandler(evt);
      this.setFiles(evt);
    });
    this.host.addEventListener('paste', (evt) => {
      this.dragleaveHandler(evt);
      this.setFiles(evt);
    });
    this.host.addEventListener('click', (event) => { // delete clicked
      if (!event.target.classList.contains('x-delete')) return;
      this.files.splice(this.files.indexOf(+event.target.dataset.id), 1);
      event.target.closest('.x-file').remove();
    })
  },
  dragoverHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.classList.add('x-dragover');
  },
  dragleaveHandler(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.classList.remove('x-dragover');
  },
  setFiles(evt) { // dataTransfer(drag/drop), clipboardData(copy/paste), target(select)
    this.files = [...(evt.dataTransfer || evt.clipboardData || evt.target).files ];

    function readURL(file) {
      return new Promise(function(res, rej) {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result);
        reader.onerror = e => rej(e);
        reader.readAsDataURL(file);
      });
    }

    this.files.forEach(async file => file.dataURL = await readURL(file));
    this.dispatchEvent(new CustomEvent('x-select', {bubbles: true, detail: this.files}));
  },
};
