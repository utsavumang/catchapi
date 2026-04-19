import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z, createEndpointSchema } from '@catchapi/shared';
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

// Extend Zod immediately at module load — before any schema is referenced
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ─── Endpoint Routes ──────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/api/v1/endpoints',
  summary: 'Create a new webhook endpoint',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registry.register('CreateEndpointBody', createEndpointSchema),
        },
      },
    },
  },
  responses: {
    201: { description: 'Endpoint created successfully' },
    400: { description: 'Validation Error (Zod)' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/endpoints',
  summary: 'Get all webhook endpoints for the authenticated user',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'Returns an array of endpoints' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/endpoints/{id}',
  summary: 'Delete a specific endpoint',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ description: 'The Mongoose ObjectId of the endpoint' }),
    }),
  },
  responses: {
    204: { description: 'Endpoint deleted successfully (No Content)' },
    404: { description: 'Endpoint not found or unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/endpoints/{endpointId}/payloads',
  summary: 'Get paginated webhooks for a specific endpoint',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      endpointId: z.string(),
    }),
    query: z.object({
      limit: z
        .string()
        .optional()
        .openapi({ description: 'Number of results to return (max 100)' }),
      cursor: z
        .string()
        .optional()
        .openapi({ description: 'The _id of the last payload seen' }),
      method: z
        .string()
        .optional()
        .openapi({ description: 'Filter by HTTP method (e.g., POST)' }),
    }),
  },
  responses: {
    200: { description: 'Returns paginated payloads with a nextCursor' },
  },
});

// ─── Document Generator ───────────────────────────────────────────────────────

const generateOpenAPIDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'CatchAPI Management Interface',
      description: 'The internal REST API for the CatchAPI React Dashboard.',
    },
    servers: [{ url: '/api/v1' }],
  });
};

// ─── Swagger Middleware Setup ─────────────────────────────────────────────────

export const setupSwagger = (app: Application): void => {
  const openApiDocument = generateOpenAPIDocument();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
