# Public API Resilience Design

## Goal

Reduce avoidable public catalog request cancellations on intermittent network paths while preserving the current local-data fallback.

## Scope

Update the public catalog API client only. The Cloudflare Worker routes, CORS policy, cache headers, and response payloads remain unchanged.

## Design

`createPublicCatalogApi` keeps its existing `Promise<unknown | null>` contract. Its default timeout changes from 1.5 seconds to 10 seconds; `VITE_PUBLIC_API_TIMEOUT_MS` remains the production override.

Each failed request writes one `console.warn` record containing only diagnostic metadata: request path, elapsed milliseconds, failure category, and (for an HTTP response) status code. The client must not log response bodies, profile contents, credentials, or request headers.

Failure categories are:

- `timeout`: the client's own `AbortController` cancelled the request after the configured timeout;
- `http_error`: an HTTP response was received but was not successful;
- `network_error`: `fetch` rejected for a reason other than the client timeout;
- `invalid_json`: a successful response could not be parsed as JSON.

All four cases return `null`, so existing hooks continue rendering their bundled catalog profile without changing page behavior.

## Testing

Add focused unit tests for the API client to cover the 10-second default and each failure category's safe metadata. Existing default API-base-url coverage remains unchanged.
