import { z } from 'zod';

export const endpointSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1, 'Endpoint name is required'),
  createdAt: z.date().optional(),
});

export const payloadSchema = z.object({
  id: z.string().uuid(),
  endpointId: z.string().uuid(),
  headers: z.record(z.string(), z.string()), // Catch HTTP headers
  body: z.record(z.string(), z.any()), // Catch arbitrary JSON payloads
  receivedAt: z.date(),
});

export type Endpoint = z.infer<typeof endpointSchema>;
export type WebhookPayload = z.infer<typeof payloadSchema>;
