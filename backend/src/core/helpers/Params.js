export const createParams = ({ 
  pageSize = 10, 
  pageIndex = 1, 
  search = '',
  maxPageSize = 50 
} = {}) => {
  return Object.freeze({
    get pageSize() {
      return Math.min(pageSize, maxPageSize);
    },
    get pageIndex() {
      return Math.max(pageIndex, 1);
    },
    get search() {
      return search.toLowerCase();
    },
    withPageSize: (newSize) => createParams({ 
      pageSize: newSize, 
      pageIndex, 
      search,
      maxPageSize 
    }),
    withPageIndex: (newIndex) => createParams({ 
      pageSize, 
      pageIndex: newIndex, 
      search,
      maxPageSize 
    }),
    withSearch: (newSearch) => createParams({ 
      pageSize, 
      pageIndex, 
      search: newSearch,
      maxPageSize 
    })
  });
};