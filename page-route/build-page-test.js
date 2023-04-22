import assert from 'assert';
import { describe, it } from 'node:test';
import { getFilesChain, getNestedValue, getPageHTML } from './index.js';

var pages = {
  "contact": "contents of /contact.html",
  "template": "start of /template.html<slot></slot>end of /template.html",
  "products": {
    "template": "start of /products/template.html<slot></slot>end of /products/template.html",
    "phone": {
      "template": "start of /products/phone/template.html\nend of /products/phone/template.html",
      "iphone": {
        "10": "contents of /products/phone/10.html",
        "11": "contents of /products/phone/11.html"
      },
      "stores": "contents /products/phone/stores.html"
    }
  }
} 

describe('getPageHTML(pages, keys)', () => {
  it('should return full html', () => {

    assert.equal(getPageHTML(pages, getFilesChain('/not-found')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/404')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/phone')), null);
    assert.equal(getPageHTML(pages, getFilesChain('/products/phone/iphone')), null);

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/iphone/11')), 
      'start of /template.html\n' + 
      'start of /products/template.html\n' +
      'start of /products/phone/template.html\n' +
      'end of /products/phone/template.html\n' +
      'contents of /products/phone/11.html\n' +
      '\n\n\n' +
      'end of /products/template.html\n' +
      'end of /template.html'
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/iphone/10')), 
      'start of /template.html\n' + 
      'start of /products/template.html\n' +
      'start of /products/phone/template.html\n' +
      'end of /products/phone/template.html\n' +
      'contents of /products/phone/10.html\n' +
      '\n\n\n' +
      'end of /products/template.html\n' +
      'end of /template.html'
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/contact')), 
      'contents of /contact.html\n\n' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/template')), 
      'start of /template.html\n\nend of /template.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/template')), 
      'start of /template.html\n' +
      'start of /products/template.html\n' +
      '\n' +
      'end of /products/template.html\n' +
      'end of /template.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/template')), 
      'start of /template.html\n' +
      'start of /products/template.html\n' +
      'start of /products/phone/template.html\n' +
      'end of /products/phone/template.html\n' +
      '\n\n' +
      'end of /products/template.html\n' +
      'end of /template.html' 
    );

    assert.equal(
      getPageHTML(pages, getFilesChain('/products/phone/stores')), 
      'start of /template.html\n' +
      'start of /products/template.html\n' +
      'contents /products/phone/stores.html\n' +
      '\n\n' +
      'end of /products/template.html\n' +
      'end of /template.html' 
    );
  })
});

describe.only('getFilesChain(url)', () => {
  it('should return files to process from an url', () => {
    assert.deepEqual(getFilesChain('/products/phone/iphone/11'), [
      'products.phone.iphone.11',
      'products.phone.template',
      'products.template',
      'template'
    ]);
    
    assert.deepEqual(getFilesChain('/products/phone/template'), [
      'products.phone.template',
      'products.template',
      'template'
    ]);

    assert.deepEqual(getFilesChain('/products/phone'), [
      'products.phone',
      'template'
    ]);

    assert.deepEqual(getFilesChain('/products/template'), [
      'products.template',
      'template'
    ]);

    assert.deepEqual(getFilesChain('/contact'), ['contact'])
    assert.deepEqual(getFilesChain('/template'), ['template'])
    assert.deepEqual(getFilesChain(''), [])
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