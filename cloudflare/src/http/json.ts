const SECURITY_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

export const jsonResponse = (
  body: unknown,
  init: ResponseInit = {},
  additionalHeaders: HeadersInit = {},
): Response => {
  const headers = new Headers(SECURITY_HEADERS);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  new Headers(additionalHeaders).forEach((value, key) => headers.set(key, value));
  return Response.json(body, { ...init, headers });
};

export const errorResponse = (status: number, code: string, message: string): Response =>
  jsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
