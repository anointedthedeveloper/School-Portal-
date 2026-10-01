export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: ApiFieldError[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
