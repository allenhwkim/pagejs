import { waitFor, loadScript } from '../../lib';

export default {
  tagName: 'my-qrcode',
  shadow: true,
  observedAttributes: ['value'],
  async resolve() {
    loadScript('//unpkg.com/qrcode@1.4.4/build/qrcode.min.js');
    await waitFor('window.QRCode');
  },
  async render({attrs}) {
    const {value = 'Hello QR Code'} = attrs;
    const imgUrl = await window['QRCode'].toDataURL(value)
    return `<img alt="${value}" src="${imgUrl}" /><br/>${value}`;
  }
};
