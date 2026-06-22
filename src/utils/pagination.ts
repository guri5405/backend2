import type { PaginationMeta, PaginationParams, RawQuery } from '../types/pagination';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

function toInt(value: unknown): number {
  if (typeof value === 'number') return Math.trunc(value);
  if (typeof value === 'string') return parseInt(value, 10);
  return NaN;
}

export function getPagination(query: RawQuery = {}): PaginationParams {
  let page = toInt(query.page);
  let limit = toInt(query.limit);

  if (!Number.isInteger(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}


export function buildPaginationMeta(totalItems: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    pageSize: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default { getPagination, buildPaginationMeta, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };
