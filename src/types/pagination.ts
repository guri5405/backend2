export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Loosely-typed query object as received from Express (`req.query`) or a typed query DTO. */
export interface RawQuery {
  page?: unknown;
  limit?: unknown;
}
