export const CONFIG = {
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/api/v2/graphql',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
} as const;

export const API_ENDPOINTS = {
  GRAPHQL: CONFIG.GRAPHQL_URL,
  AUTH: `${CONFIG.GRAPHQL_URL.replace('/api/v2/graphql', '')}/api/v2/auth`,
  USER: `${CONFIG.GRAPHQL_URL.replace('/api/v2/graphql', '')}/api/v2/user`,
} as const; 