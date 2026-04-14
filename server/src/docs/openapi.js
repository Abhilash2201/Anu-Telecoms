export const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Anu Telecom API',
    version: '1.0.0',
    description: 'OpenAPI specification for the Anu Telecom single-store backend.'
  },
  servers: [
    {
      url: '/api',
      description: 'Current server'
    }
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Auth', description: 'Registration, login, and profile access' },
    { name: 'Storefront', description: 'Store metadata and featured content' },
    { name: 'Products', description: 'Product catalog access' },
    { name: 'Categories', description: 'Category management and listing' },
    { name: 'Orders', description: 'Customer order placement and history' },
    { name: 'Admin', description: 'Administrative dashboards and product maintenance' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Unauthorized'
          }
        }
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-1713038400000' },
          email: { type: 'string', example: 'customer@example.com' },
          role: { type: 'string', example: 'USER' },
          name: { type: 'string', example: 'Customer' }
        }
      },
      AuthTokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOi...' },
          user: {
            $ref: '#/components/schemas/AuthUser'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          name: { type: 'string', example: 'Ravi Kumar' },
          email: { type: 'string', example: 'ravi@example.com' },
          password: { type: 'string', example: 'StrongPass123' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'ravi@example.com' },
          password: { type: 'string', example: 'StrongPass123' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          slug: { type: 'string', example: 'iphone-15-pro' },
          name: { type: 'string', example: 'iPhone 15 Pro' },
          brand: { type: 'string', example: 'Apple' },
          category: { type: 'string', example: 'Mobiles' },
          categorySlug: { type: 'string', example: 'mobiles' },
          price: { type: 'number', example: 129999 },
          discount: { type: 'number', example: 10 },
          discountedPrice: { type: 'number', example: 116999 },
          image: { type: 'string', example: 'https://dummyimage.com/900x700/0b2130/ffffff&text=iPhone+15+Pro' },
          images: {
            type: 'array',
            items: { type: 'string' }
          },
          description: { type: 'string' },
          stock: { type: 'number', example: 12 },
          rating: { type: 'number', example: 4.8 },
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          highlights: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat-mobiles' },
          name: { type: 'string', example: 'Mobiles' },
          productCount: { type: 'number', example: 12 }
        }
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          id: { type: 'string', example: 'cat-gaming' },
          name: { type: 'string', example: 'Gaming' }
        }
      },
      Address: {
        type: 'object',
        required: ['fullName', 'city', 'pinCode'],
        properties: {
          fullName: { type: 'string', example: 'Raj Kumar' },
          city: { type: 'string', example: 'Chennai' },
          pinCode: { type: 'string', example: '600001' }
        }
      },
      OrderItem: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', example: '1' },
          quantity: { type: 'integer', example: 1 }
        }
      },
      OrderRequest: {
        type: 'object',
        required: ['items', 'address', 'paymentMethod'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' }
          },
          address: { $ref: '#/components/schemas/Address' },
          paymentMethod: { type: 'string', example: 'COD' },
          total: { type: 'number', example: 129999 }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1713038400000' },
          userId: { type: 'string', example: 'user-1' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' }
          },
          address: { $ref: '#/components/schemas/Address' },
          paymentMethod: { type: 'string', example: 'COD' },
          paymentStatus: { type: 'string', example: 'PENDING' },
          total: { type: 'number', example: 129999 },
          status: { type: 'string', example: 'PENDING' },
          trackingId: { type: ['string', 'null'], example: 'TRK-ANU-1001' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AdminProductAction: {
        type: 'object',
        required: ['action', 'product'],
        properties: {
          action: {
            type: 'string',
            enum: ['create', 'update', 'delete']
          },
          product: { $ref: '#/components/schemas/Product' }
        }
      },
      ProductListResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 12 },
              totalItems: { type: 'integer', example: 120 },
              totalPages: { type: 'integer', example: 10 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Registered' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokenResponse' }
              }
            }
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/storefront': {
      get: {
        tags: ['Storefront'],
        summary: 'Get store profile and featured storefront data',
        responses: {
          200: { description: 'Storefront snapshot' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Free-text search over product name and brand'
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', default: 'all' },
            description: 'Category slug filter'
          },
          {
            name: 'brand',
            in: 'query',
            schema: { type: 'string' },
            description: 'Brand filter (single or comma-separated)'
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' }
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' }
          },
          {
            name: 'minDiscount',
            in: 'query',
            schema: { type: 'number' }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 12 }
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'price', 'rating', 'discount', 'name'] }
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
          }
        ],
        responses: {
          200: {
            description: 'Product list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductListResponse' }
              }
            }
          }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Product found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        responses: {
          200: {
            description: 'Category list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Category created' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'includeProducts', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Category found' },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update category (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Category updated' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Conflict', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Category has products', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create a customer order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Order created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    order: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          },
          400: { description: 'Validation or stock error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      get: {
        tags: ['Orders'],
        summary: 'List orders for the current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Order list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard snapshot' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'List all orders for admin review',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All orders' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/admin/products': {
      post: {
        tags: ['Admin'],
        summary: 'Create, update, or delete a product in the admin API',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminProductAction' }
            }
          }
        },
        responses: {
          200: { description: 'Product action handled' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    }
  }
};
