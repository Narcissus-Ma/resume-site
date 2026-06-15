import { errorResponse } from './json';

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Authorization, Content-Type';

const getAllowedOrigins = (value: string): Set<string> =>
  new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const createCorsHeaders = (origin: string): Headers => {
  const headers = new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
  return headers;
};

export const handleCors = (
  request: Request,
  allowedOriginsValue: string,
): { response?: Response; headers?: Headers } => {
  const origin = request.headers.get('Origin');
  if (!origin) return {};

  if (!getAllowedOrigins(allowedOriginsValue).has(origin)) {
    return {
      response: errorResponse(403, 'ORIGIN_NOT_ALLOWED', '当前来源不允许访问此服务'),
    };
  }

  const headers = createCorsHeaders(origin);
  if (request.method === 'OPTIONS') {
    return { response: new Response(null, { status: 204, headers }) };
  }
  return { headers };
};

export const appendCorsHeaders = (response: Response, headers?: Headers): Response => {
  if (!headers) return response;
  const nextHeaders = new Headers(response.headers);
  headers.forEach((value, key) => nextHeaders.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders,
  });
};
