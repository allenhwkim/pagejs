import { customElement, loadScript, waitFor } from '../../lib';

export default {
  tagName: 'my-map',
  shadow: false, // document-level ol.css not applying into shadow dom.
  async resolve() {
    loadScript('//cdn.jsdelivr.net/npm/ol@v7.2.2/dist/ol.js', '//cdn.jsdelivr.net/npm/ol@v7.2.2/ol.css');
    await waitFor('window.ol');
  },
  css: ':host {display: block; height: 300px;}',
  observedAttributes: ['center', 'zoom'],
  render({attrs}) {
    const {center='Brampton Ontario, Canada', zoom= 11} = attrs;

    this.getLonLat(center).then(lonLat => {
      const map = new window['ol'].Map({ target: this });
      map.addLayer(new window['ol'].layer.Tile({source: new window['ol'].source.OSM()}));
      map.getView().setCenter(window['ol'].proj.fromLonLat(lonLat));
      map.getView().setZoom(zoom);
    });
  },
  getLonLat(address) {
    return new Promise( resolve => {
      if (typeof address === 'string' && address.match(/[-0-9.]+,\s?[-0-9.]+/)) { //'-99.99, 99'
        const lonLat = address.split(',').map(el => +(el.trim()));
        resolve(lonLat);
      } else if (typeof address === 'string') {
        const url = `https://nominatim.openstreetmap.org/search?q=${address}&format=json`;
        window.fetch(url).then(resp => resp.json())
          .then(resp => {
            const lonLat = resp[0] ? [resp[0].lon, resp[0].lat] : [0,0];
            resolve(lonLat);
          });
      }
    });
  }
};
