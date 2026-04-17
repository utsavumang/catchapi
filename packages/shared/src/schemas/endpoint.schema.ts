import { z } from 'zod';

// Endpoint as the user sends it
export const createEndpointSchema = z.object({
  name: z.string().max(50, 'Name cannot exceed 50 characters').optional(),
  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional(),
});

// The complete Endpoint object as it exists in Mongoose
export const endpointSchema = z.object({
  _id: z.string(),
  urlId: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date().or(z.string()),
});

// Payload as we send to user
export const payloadSchema = z.object({
  _id: z.string(),
  endpointId: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.record(z.string(), z.any()),
  receivedAt: z.date().or(z.string()),
});

// Pagination and Query Schemas

// Validating Incoming Query
export const getPayloadsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),

  cursor: z.string().optional(),

  method: z.string().toUpperCase().optional(),
});

// Interfrace for frontend's paginated API response
export interface PaginatedPayloadResponse {
  status: 'success';
  results: number;
  data: WebhookPayload[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type GetPayloadsQuery = z.infer<typeof getPayloadsQuerySchema>;
export type CreateEndpointInput = z.infer<typeof createEndpointSchema>;
export type Endpoint = z.infer<typeof endpointSchema>;
export type WebhookPayload = z.infer<typeof payloadSchema>;
