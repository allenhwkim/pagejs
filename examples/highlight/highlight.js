import { loadScript, waitFor, fixIndent } from '../../lib';

export default {
  tagName: 'my-highlight',
  shadow: false, // document hl-js style not injecting into shadow dom
  async resolve () {
    loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css',
    );
    await waitFor('window.hljs');
  },
  css: `
    :host {display: block; font-family: monospace; white-space: pre;}
    :host pre.hljs {background: #F0F0F0; padding: 12px;}
  `,
  observedAttributes: ['language'],
  connectedCallback() {
    const code = this.innerHTML;
    const language = this.getAttribute('language') || 'javascript';
    this.host.innerHTML = '<pre language="'+language+'"></pre>';
    this.host.querySelector('pre').innerHTML = fixIndent(code);
    window['hljs'].highlightElement(this.host.querySelector('pre'));
  }
};