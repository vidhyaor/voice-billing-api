import type { PaginationMeta } from "./pagination.js";

export function successResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta) {
  return {
    success: true as const,
    data,
    meta,
  };
}

export function messageResponse(message: string) {
  return successResponse({ message });
}
