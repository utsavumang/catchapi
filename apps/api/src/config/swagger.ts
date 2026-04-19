import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

import {
  z,
  createEndpointSchema,
  loginSchema,
  registerSchema,
} from '@catchapi/shared';

import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ─── Auth Routes ──────────────────────────────────────────────────────────────

const authResponseSchema = z
  .object({
    _id: z.string().openapi({ description: 'MongoDB ObjectId of the user' }),
    name: z.string().openapi({ example: 'John Doe' }),
    email: z.string().email().openapi({ example: 'john@example.com' }),
    token: z.string().openapi({
      description:
        'JWT Bearer token. Store this and send it in the Authorization header.',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
  })
  .openapi('AuthResponse');

const meResponseSchema = z
  .object({
    status: z.string().openapi({ example: 'success' }),
    data: z.object({
      user: z.object({
        _id: z.string(),
        name: z.string().openapi({ example: 'John Doe' }),
        email: z.string().email().openapi({ example: 'john@example.com' }),
      }),
    }),
  })
  .openapi('MeResponse');

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Register a new user',
  description: 'Creates a new user account and returns a JWT token on success.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registry.register('RegisterBody', registerSchema),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: registry.register('AuthResponse', authResponseSchema),
        },
      },
    },
    400: { description: 'User already exists or validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Login with existing credentials',
  description: 'Authenticates a user and returns a JWT token on success.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registry.register('LoginBody', loginSchema),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AuthResponse' },
        },
      },
    },
    401: { description: 'Invalid email or password' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Get current authenticated user',
  description:
    'Returns the profile of the currently logged-in user. Requires a valid JWT token.',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: 'Current user returned successfully',
      content: {
        'application/json': {
          schema: registry.register('MeResponse', meResponseSchema),
        },
      },
    },
    401: { description: 'Not authorized. Token missing or expired.' },
  },
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
