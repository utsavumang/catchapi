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
  updateProfileSchema,
  changePasswordSchema,
  replayPayloadSchema,
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

// Auth Routes

const authResponseSchema = z
  .object({
    _id: z.string().openapi({ description: 'MongoDB ObjectId of the user' }),
    name: z.string().openapi({ example: 'John Doe' }),
    email: z.string().email().openapi({ example: 'john@example.com' }),
    token: z.string().openapi({
      description:
        'Short-lived JWT access token (15 minutes). Send this in the Authorization header. A refresh token is separately set as an httpOnly cookie.',
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
  description:
    'Creates a new user account. Returns a short-lived access token in the response body and sets a long-lived refresh token as an httpOnly cookie.',
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
  description:
    'Authenticates a user. Returns a short-lived access token in the response body and sets a long-lived refresh token as an httpOnly cookie.',
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
  method: 'post',
  path: '/api/v1/auth/refresh',
  summary: 'Refresh access token',
  description:
    'Issues a new access token using the refresh token stored in the httpOnly cookie. The refresh token is automatically rotated — a new one is set in the cookie and the old one is invalidated.',
  responses: {
    200: {
      description: 'New access token issued successfully',
      content: {
        'application/json': {
          schema: z.object({
            token: z.string().openapi({
              description: 'New JWT access token. Valid for 15 minutes.',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            }),
          }),
        },
      },
    },
    401: {
      description: 'Refresh token missing, invalid, already used, or expired.',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  summary: 'Logout current session',
  description:
    'Invalidates the refresh token in the database and clears the httpOnly cookie. The access token expires naturally within 15 minutes.',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'success' }),
            message: z.string().openapi({ example: 'Logged out successfully' }),
          }),
        },
      },
    },
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

registry.registerPath({
  method: 'patch',
  path: '/api/v1/auth/profile',
  summary: 'Update display name',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registry.register('UpdateProfileBody', updateProfileSchema),
        },
      },
    },
  },
  responses: {
    200: { description: 'Profile updated successfully' },
    401: { description: 'Not authorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/auth/password',
  summary: 'Change account password',
  description:
    'Verifies the current password before updating. Invalidates all active sessions on success — the user must log in again.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registry.register('ChangePasswordBody', changePasswordSchema),
        },
      },
    },
  },
  responses: {
    200: { description: 'Password changed. All active sessions invalidated.' },
    401: { description: 'Current password is incorrect' },
  },
});

// Endpoint Routes

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
  method: 'get',
  path: '/api/v1/endpoints/{id}',
  summary: 'Get a single endpoint by ID',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z
        .string()
        .openapi({ description: 'The MongoDB ObjectId of the endpoint' }),
    }),
  },
  responses: {
    200: { description: 'Returns the endpoint object' },
    404: { description: 'Endpoint not found or unauthorized' },
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

registry.registerPath({
  method: 'post',
  path: '/api/v1/endpoints/{endpointId}/payloads/{payloadId}/replay',
  summary: 'Replay a captured payload to a target URL',
  description:
    'Forwards the original payload to the specified target URL with the original method, filtered headers, and body. Infrastructure and proxy headers are stripped. Returns the target response status.',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      endpointId: z.string(),
      payloadId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: registry.register('ReplayPayloadBody', replayPayloadSchema),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Replay completed. Returns the target response status code.',
    },
    404: { description: 'Endpoint or payload not found' },
    502: { description: 'Target URL was unreachable' },
  },
});

// Document Generator

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

// Swagger Middleware Setup

export const setupSwagger = (app: Application): void => {
  const openApiDocument = generateOpenAPIDocument();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
