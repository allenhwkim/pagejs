import assert from 'assert';
import { describe, it } from 'node:test';
import { encode, decode, getNestedValue, setNestedVal } from './index.js';

describe('encode(str)/decode(str)', () => {
  it('should should encode string', () => {
    const encoded = encode('Hello World');
    const decoded = decode(encoded);
    const encBase64  = Buffer.from(encoded).toString('base64')
    assert.equal(encBase64, 'eMKcw7NIw43DicOJVwjDjy/DikkBABgLBB0=');
    assert.equal(decoded, 'Hello World');
  });

  it('should should encode json string', () => {
    const encoded = encode('{"Hello": "World"}');
    const decoded = decode(encoded);
    const encBase64  = Buffer.from(encoded).toString('base64')
    assert.equal(encBase64, 'eMKcwqtWw7JIw43DicOJV8KyUlAKw48vw4pJUcKqBQA2wrkFw5c=');
    assert.deepEqual(decoded, {Hello: 'World'});
  });
});

describe('getNestedValue(obj, key)', () => {
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

describe('setNestedValue(obj, key, value)', () => {
  it('should return object value', () => {
    var obj = {};
    setNestedVal(obj, 'a.b.c.d', 'Hello World')
    assert.equal(obj.a.b.c.d, 'Hello World');
  });
});