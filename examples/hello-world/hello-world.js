export default {
  tagName: 'hello-world',
  observedAttributes: ['value'],
  async render({attrs}) {
    return `<h1>Hello ${attrs.value || 'World'}</h1>`;
  }
};