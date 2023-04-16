import { loadScript, waitFor, fixIndent } from '../../lib';

export default {
  tagName: 'my-highlight',
  shadow: true, // document hl-js style not injecting into shadow dom
  observedAttributes: ['language'],
  connectedCallback() {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js');
  },
  async render({attrs}) {
    await waitFor('window.hljs');

    const source = fixIndent(this.host.textContent);
    const language = attrs.language || 'javascript';
    const highlighted = window['hljs'].highlight(source, {language}).value;
    return `
      <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css" />
      <pre style="padding: 12px; background: #F0F0F0" language="${language}">${highlighted}</pre>`;
  }
};