import {BackendResponse} from './backend-response';

export const defaultPerPage = 15;
export const perPageOptions = [{key: 15}, {key: 30}, {key: 60}, {key: 100}];

export type SimplePaginationMeta = {
  from: number | null;
  to: number | null;
  per_page: number;
  current_page: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
};

export type LengthAwarePaginationMeta = SimplePaginationMeta & {
  total: number;
  last_page: number;
};

export type CursorPaginationMeta = {
  next_cursor: string | null;
  prev_cursor: string | null;
  per_page: number;
};

export type PaginationMeta =
  SimplePaginationMeta | LengthAwarePaginationMeta | CursorPaginationMeta;

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type PaginatedResource<T = unknown> = {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
};

export function hasPreviousPage(
  meta: PaginationMeta | PaginatedBackendResponse<any> | PaginatedResource<any>,
): boolean {
  return getPreviousPageParam(meta) != null;
}

export function hasNextPage(
  meta: PaginationMeta | PaginatedBackendResponse<any> | PaginatedResource<any>,
): boolean {
  return getNextPageParam(meta) != null;
}

export function getPreviousPageParam(
  response:
    PaginationMeta | PaginatedBackendResponse<any> | PaginatedResource<any>,
): number | string | null {
  if (!('meta' in response || 'pagination' in response)) {
    response = {pagination: response as PaginationResponse<any>};
  }

  if ('meta' in response) {
    if ('prev_cursor' in response.meta) {
      return response.meta.prev_cursor;
    }

    if (response.links.prev == null) {
      return null;
    }

    return response.meta.current_page < 2
      ? null
      : response.meta.current_page - 1;
  }

  if ('pagination' in response) {
    if ('prev_cursor' in response.pagination) {
      return response.pagination.prev_cursor;
    }

    if (response.pagination.prev_page_url == null) {
      return null;
    }

    return response.pagination.current_page < 2
      ? null
      : response.pagination.current_page - 1;
  }

  return null;
}

export function getNextPageParam(
  response:
    PaginationMeta | PaginatedBackendResponse<any> | PaginatedResource<any>,
): number | string | null {
  if (!('meta' in response || 'pagination' in response)) {
    response = {pagination: response as PaginationResponse<any>};
  }

  if ('meta' in response) {
    if ('next_cursor' in response.meta) {
      return response.meta.next_cursor;
    }

    if (response.links.next == null) {
      return null;
    }

    return response.meta.current_page + 1;
  }

  if ('pagination' in response) {
    if ('next_cursor' in response.pagination) {
      return response.pagination.next_cursor;
    }

    if (response.pagination.next_page_url == null) {
      return null;
    }

    return response.pagination.current_page + 1;
  }

  return null;
}

export function getTotal(
  response:
    | Omit<PaginatedResource, 'data'>
    | PaginatedBackendResponse<any>
    | {data: any[]},
): number | null {
  if (
    'meta' in response &&
    'total' in response.meta &&
    response.meta.total != null
  ) {
    return response.meta.total;
  }

  if (
    'pagination' in response &&
    'total' in response.pagination &&
    response.pagination.total != null
  ) {
    return response.pagination.total;
  }

  return null;
}

export function getPerPage(
  response: Omit<PaginatedResource, 'data'> | PaginatedBackendResponse<any>,
): number | null {
  if ('meta' in response) {
    return response.meta.per_page;
  }

  if ('pagination' in response) {
    return response.pagination.per_page;
  }

  return null;
}

// legacy, use PaginatedResource and PaginationMeta instead
export type LengthAwarePaginationResponse<T = unknown> =
  LengthAwarePaginationMeta & {
    data: T[];
  };

export type SimplePaginationResponse<T = unknown> = SimplePaginationMeta & {
  data: T[];
};

export type CursorPaginationResponse<T> = CursorPaginationMeta & {
  data: T[];
};

export type PaginationResponse<T> =
  | LengthAwarePaginationResponse<T>
  | SimplePaginationResponse<T>
  | CursorPaginationResponse<T>;

export interface PaginatedBackendResponse<T> extends BackendResponse {
  pagination: PaginationResponse<T>;
}

export const EMPTY_PAGINATION_RESPONSE = {
  pagination: {data: [], from: 0, to: 0, per_page: 15, current_page: 1},
};
