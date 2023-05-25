export default {
  tagName: 'hello-world',
  observedAttributes: ['value'],
  props: { time: new Date() },
  connectedCallback() {
    setInterval(() => this.time = new Date(), 1000)
  },
  async render({attrs}) {
    return `
      <h1>Hello ${attrs.value || 'World'}</h1>
      ${new Date()}
    `;
  }
};