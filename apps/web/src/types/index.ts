export interface EndpointWithUrl {
  _id: string;
  urlId: string;
  fullUrl: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
}

export interface Payload {
  _id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown> | string;
  createdAt: string;
}

export interface PaginatedPayloads {
  status: 'success';
  results: number;
  data: Payload[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ListResponse<T> {
  status: 'success';
  results: number;
  data: T[];
}
