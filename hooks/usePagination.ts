import { useState } from 'react';

/**
 * Page state for a list. With `items` it slices them in the browser; without, it only tracks
 * page/pageSize for a server-side list. Changing `resetKey` (e.g. the filters) goes back to page 1.
 */
export function usePagination<T>(items: T[] | undefined, { pageSize: initialSize = 25, resetKey }: { pageSize?: number; resetKey?: unknown } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);

  // Adjusting state while rendering (not in an effect) so the stale page never paints
  const resetToken = JSON.stringify(resetKey ?? null);
  const [seenToken, setSeenToken] = useState(resetToken);
  if (seenToken !== resetToken) {
    setSeenToken(resetToken);
    setPage(1);
  }

  // After a delete or a narrower filter the current page may no longer exist
  const totalCount = items?.length ?? 0;
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const current = items && page > lastPage ? lastPage : page;

  return {
    page: current,
    pageSize,
    totalCount,
    pageItems: items?.slice((current - 1) * pageSize, current * pageSize) ?? [],
    paginationProps: {
      page: current,
      pageSize,
      totalCount,
      onPageChange: setPage,
      onPageSizeChange: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
    },
    setPage,
  };
}
