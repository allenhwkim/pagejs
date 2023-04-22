// ['products.phone.iphone.11', 'products.phone.index', 'products.index', 'index'];
export function getPageHTML(pages, filesChain) {
  try {
    return filesChain.reduce( (html, varName) =>  {
      const partial = getNestedValue(pages, varName);
      if (partial) {
        const partial2 = partial + (partial.indexOf('<slot></slot>') > 0 ? '' : '<slot></slot>'); 
        const slotFilled = partial2.replace('<slot></slot>', `\n${html}\n`);
        return slotFilled;
      } else {
        throw "Page not found"
      }
    }, '');
  } catch(e) {
    return null; 
  }
}

export function getFilesChain(url) {
  // if ends with / add file name 'index' 
  url += url.endsWith('/') ? 'index' : ''

  // remove the first '/' and get paths
  const url2 = url.replace(/^\//, '');
  const paths = url2.split('/');
  const files = [];

  if (paths.length) {
    while(paths.length) {
      files.push( paths.join('.') );
      paths.pop(); 
      paths.length && (paths[paths.length - 1] = 'index')
    }
  }

  return files;
}

// usage getNestedValue({a: {b: {c: 'd'}}}, 'a.b.c')
export function getNestedValue(obj, keys) {
  return keys.split('.').reduce(function(o, x) {
    return (typeof o == 'undefined' || o === null) ? o : o[x];
  }, obj);
}
