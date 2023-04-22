import assert from 'assert';
import { describe, it } from 'node:test';
import { getFilesChain, getNestedValue, getPageHTML } from './build-page.js';

var pages = {
  "contact": "contents of /contact.html",
  "index": "start of /index.html<slot></slot>end of /index.html",
  "products": {
      "index": "start of /products/index.html<slot></slot>end of /products/index.html",
      "phone": {
          "index": "start of /products/phone/index.html\nend of /products/phone/index.html",
          "iphone": {
              "10": "contents of /products/phone/10.html",
              "11": "contents of /products/phone/11.html"
          },
          "stores": "contents /products/phone/stores.html"
      }
  }
} 

describe.only('getPageHTML(pages, keys)', () => {
  it('should return full html', () => {

    assert.equal(getPageHTML(pages, getFilesChain('/not-found')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/404')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/phone')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/phone/iphone')), null);

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/iphone/11')), 
      'start of /index.html\n' + 
      'start of /products/index.html\n' +
      'start of /products/phone/index.html\n' +
      'end of /products/phone/index.html\n' +
      'contents of /products/phone/11.html\n' +
      '\n\n\n' +
      'end of /products/index.html\n' +
      'end of /index.html'
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/iphone/10')), 
      'start of /index.html\n' + 
      'start of /products/index.html\n' +
      'start of /products/phone/index.html\n' +
      'end of /products/phone/index.html\n' +
      'contents of /products/phone/10.html\n' +
      '\n\n\n' +
      'end of /products/index.html\n' +
      'end of /index.html'
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/contact')), 
      'contents of /contact.html\n\n' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/index')), 
      'start of /index.html\n\nend of /index.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/index')), 
      'start of /index.html\n' +
      'start of /products/index.html\n' +
      '\n' +
      'end of /products/index.html\n' +
      'end of /index.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/index')), 
      'start of /index.html\n' +
      'start of /products/index.html\n' +
      'start of /products/phone/index.html\n' +
      'end of /products/phone/index.html\n' +
      '\n\n' +
      'end of /products/index.html\n' +
      'end of /index.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/stores')), 
      'start of /index.html\n' +
      'start of /products/index.html\n' +
      'contents /products/phone/stores.html\n' +
      '\n\n' +
      'end of /products/index.html\n' +
      'end of /index.html' 
    );
    /*
    {
      "products": {
          "phone": {
              "stores": "contents /products/phone/stores.html"
          }
      }
    }
    */
  })
});

describe('getFilesChain(url)', () => {
  it('should return files to process from an url', () => {
    assert.deepEqual(getFilesChain('/products/phone/iphone/11'), [
      'products.phone.iphone.11',
      'products.phone.index',
      'products.index',
      'index'
    ]);
    
    assert.deepEqual(
      getFilesChain('/products/phone/iphone/'),
      getFilesChain('/products/phone/iphone/index')
    );

    assert.deepEqual(getFilesChain('/products/phone/index'), [
      'products.phone.index',
      'products.index',
      'index'
    ]);

    assert.deepEqual(
      getFilesChain('/products/phone/'), 
      getFilesChain('/products/phone/index')
    );

    assert.deepEqual(getFilesChain('/products/phone'), [
      'products.phone',
      'index'
    ]);

    assert.deepEqual(getFilesChain('/products/index'), [
      'products.index',
      'index'
    ]);

    assert.deepEqual(
      getFilesChain('/products/'), 
      getFilesChain('/products/index')
    );

    assert.deepEqual(getFilesChain('/contact'), ['contact'])
    assert.deepEqual(getFilesChain('/index'), ['index'])
    assert.deepEqual(getFilesChain('/'), ['index'])
    assert.deepEqual(getFilesChain(''), [''])
  });
})

describe('getNestedValue(obj, keyu)', () => {
  var obj = { a: { b: { c: "d" } } };
  it('should return object value', () => {
    assert.equal(getNestedValue(obj, 'a.b.c'), 'd');
    assert.deepEqual(getNestedValue(obj, 'a.b'), {c: 'd'});
    assert.deepEqual(getNestedValue(obj, 'a'), {b: {c: 'd'}});

    assert.equal(getNestedValue(obj, 'a.b.c.d'), null);
    assert.equal(getNestedValue(obj, 'a.b.d'), null);
    assert.equal(getNestedValue(obj, 'a.d'), null);
    assert.equal(getNestedValue(obj, 'd'), null);
  });
});