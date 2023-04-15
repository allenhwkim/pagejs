import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';
// const postcss = require('postcss');
// const postcssNesting = require('postcss-nesting');

var YOUR_CSS = `
:host {
  display: inline-block;
  position: relative;

  &:focus-within ul {
    display: block;
  }
}

input {
  min-width: 200px;
  height: 32px;
  padding: 0 20px 0 4px;
  border: 1px solid #CCC;
  background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z' fill='%23666' /><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 50%;
  border-radius: 4px;
  box-sizing: border-box;

  &:read-only {
    pointer-events: none;
  }
}

ul {
  display: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  position: absolute;
  min-width: 200px;
  max-width: 100vw;
  max-height: 200px;
  white-space: nowrap;
  background: #FFF;
  overflow: auto;
  z-index: 1;

  &:empty {
    display: none;
  }

  > li {
    line-height: 26px;
    padding: 0 2px;

    &.disabled {
      pointer-events: none;
    }

    &:is(.x2-highlighted, :hover) {
      background: #529FFF;
      color: #FFF;
    }

    &.x-selected:before {
      content: '✓ ';
    }
  }
}`;


console.log(
  postcss([ postcssNesting(/* pluginOptions */)]).process(YOUR_CSS /*, processOptions */).css
);

