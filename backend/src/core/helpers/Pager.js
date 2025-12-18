export const createPager = ({ 
  registers = [], 
  total = 0, 
  pageIndex = 1, 
  pageSize = 10, 
  search = '' 
} = {}) => {
  const totalPages = Math.ceil(total / pageSize);
  const hasPreviousPage = pageIndex > 1;
  const hasNextPage = pageIndex < totalPages;

  return Object.freeze({
    registers,
    total,
    pageIndex,
    pageSize,
    search,
    
    totalPages,
    hasPreviousPage,
    hasNextPage,
    
    mapRegisters: (mapperFn) => createPager({
      registers: registers.map(mapperFn),
      total,
      pageIndex,
      pageSize,
      search
    }),
    
    filterRegisters: (predicateFn) => createPager({
      registers: registers.filter(predicateFn),
      total: registers.filter(predicateFn).length,
      pageIndex,
      pageSize,
      search
    }),
    
    getPaginationInfo: () => ({
      currentPage: pageIndex,
      pageSize,
      totalCount: total,
      totalPages,
      hasPrevious: hasPreviousPage,
      hasNext: hasNextPage,
      search
    })
  });
};