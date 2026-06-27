export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  success: false;
  errors?: Record<string, string[]>;
}
