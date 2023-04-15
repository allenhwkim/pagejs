 import css from './pagination.css?inline';

 export default {
  tagName: 'my-pagination',
  css,
  observedAttributes: ['total', 'index', 'numPerPage', 'numPages'], // index is the current page
  constructorCallback() {
    this.addEventListener('click', (event) => {
      const clickedEl = event.target;
      console.log('.......click', clickedEl.classList.contains('page'));
      if (clickedEl.classList.contains('page')) { 
        this.setAttribute('index', clickedEl.getAttribute('index')); // cause re-rendering
  
        const {index=0, numPerPage=5, total=100} = this.attrs;
        const customEvent = 
          new CustomEvent('select', {bubbles: true, detail: {index, numPerPage, total}});
        this.dispatchEvent(customEvent);
      }
    });
  },
  render({attrs, props}) {
    console.log(JSON.stringify({attrs}));
    
    (attrs.numPages % 2 === 0) && attrs.numPages++; // make it odd number
    const {total=100, index=0, numPerPage=10, numPages=5} = attrs;

    const pages = this.getPages({total, index, numPerPage, numPages});
    const [pages0, pagesX] = [pages[0], pages.slice(-1)[0]];
    const pages0Index = (pages0 -1) * numPerPage;
    const pagesXIndex =  (pagesX -1) * numPerPage;
    console.log('.........pages', index, pages)

    const fDisabled = !(pages0Index > numPerPage) ? 'disabled' : '';
    const pDisabled = !(pages0Index > 0) ? 'disabled' : '';
    const nDisabled = !(total > pagesXIndex + numPerPage) ? 'disabled' : '';
    const lDisabled = !(total > (pagesXIndex + numPerPage*2)) ? 'disabled' : '';
  
    return `
      <button class="first page navigation" title="first page" 
        index="0" ${fDisabled}></button>
      <button class="prev page navigation" title="previous page" 
        index="${pages0Index - numPerPage}" ${pDisabled}></button>
      <div class="pages">
        ${
          pages.map(page => {
            const pageNum = (page - 1) * numPerPage;
            const selected = pageNum === index ? ' selected' : '';
            return `<button class="page${selected}" index="${pageNum}">${page}</button>`;
          }).join('\n')
        }</div>
      <button class="next page navigation" title="next page" 
        index="${pagesXIndex + numPerPage}" ${nDisabled}></button>
      <button class="last page navigation" title="last page" 
        index="${total - numPerPage}" ${lDisabled}></button>
    `;
  },
  getPages({total, numPerPage, index, numPages}) {
    const totalPages = Math.ceil(total / numPerPage);
    const currentPage = (index + numPerPage) / numPerPage;
    const numNeighbor = (numPages - 1) / 2;

    let middlePage = currentPage;
    if ((numNeighbor*2 - currentPage) >= 1) { // currentPage is a low number
      middlePage = numNeighbor + 1;
    } else if ((numNeighbor + currentPage) > totalPages) { // currentPage is a high number
      middlePage = totalPages - numNeighbor;
    }
    const minPage = Math.max(middlePage - numNeighbor, 1);
    const maxPage = Math.min(totalPages, middlePage + numNeighbor);

    function range(start, end) {
      return Array.from({ length }, (_, i) => start + i);
    }

    var length = maxPage - minPage + 1;
    return [...Array(length).keys()].map(el => el + minPage);
  }
};
  