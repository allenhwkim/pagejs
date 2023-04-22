import { getNestedValue } from './index.js';

// ['products.phone.iphone.11', 'products.phone.template', 'products.template', 'template'];
export function getPageHTML(pages, filesChain) {
  try {
    return filesChain.reduce( (html, varName) =>  {
      const partial = getNestedValue(pages, varName);
      if (partial) {
        return partial.replace('<slot></slot>', `\n${html}\n`);
      } else {
        throw "Page not found"
      }
    }, '');
  } catch(e) {
    return null; 
  }
}

export function getFilesChain(url) {
  // remove the first '/' and get paths as an array
  const paths = url.replace(/^\//, '').split('/').filter(el => el);
  const files = [];

  if (paths.length) {
    while(paths.length) {
      // insert the destination file contents
      files.push( paths.join('.') );
      // insert template of all parent directories
      paths.pop(); 
      paths.length && (paths[paths.length - 1] = 'template')
    }
  }

  return files;
}