# Family Memories API Requirements

## Purpose

Provide the individual family remembrance entries displayed in the memorial home page’s **Family Memories** section. The API response must support the current mock at `client/public/mock-api/family-memories.json` without requiring presentation changes in the React client.

## Endpoint

`GET /api/memorials/jared-earl-hazleton/memories`

The production URL will be configured through `VITE_FAMILY_MEMORIES_API_URL`. The endpoint must be accessible from `texecon.com` by browser clients and support CORS for the deployed site when hosted on another domain.

### Request

- Method: `GET`
- Required header: `Accept: application/json`
- Authentication: public read access is acceptable for published memories; administrative write access is out of scope.
- Query parameters: none required for the initial release.
- The request should accept an `AbortSignal`/client disconnect and stop unnecessary work when the caller cancels.

## Response contract

The preferred response is a JSON array of memory objects:

```json
[
  {
    "personName": "Mark Hazleton",
    "personPronouns": "he/him",
    "relationshipToJared": "Youngest son of Jared Hazleton",
    "body": "A remembrance written by the contributor.\n\nA second paragraph."
  }
]
```

The client currently also understands these equivalent envelopes for migration compatibility:

```json
{ "memories": [] }
```

```json
{ "data": [] }
```

```json
{ "data": { "memories": [] } }
```

The API should use the plain array response unless the CMS requires an envelope.

### Memory fields

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `personName` | string | yes | Contributor’s display name; must not be blank. |
| `personPronouns` | string | yes | Display value such as `he/him`, `she/her`, or `they/them`; must not be blank. |
| `relationshipToJared` | string | yes | Short relationship label shown below the contributor name; must not be blank. |
| `body` | string | yes | Full remembrance text; must not be blank. Paragraphs are separated by two newline characters (`\n\n`). |

### Body formatting

- Preserve paragraph boundaries using `\n\n`.
- Plain text is the default format.
- The current client supports inline Markdown links only in the form `[label](https://example.com)`.
- Link labels may be wrapped in `**` for bold text.
- Only HTTPS links may be published. The API must reject or sanitize JavaScript, data, and other unsafe URL schemes.
- The API must return text rather than raw HTML. HTML rendering and sanitization are client responsibilities if the contract is expanded later.

## Ordering and publication

- Return memories in editorial display order.
- Do not return unpublished, deleted, or draft entries.
- An empty published collection returns `200 OK` with `[]`.
- Each entry should have a stable internal identifier in the CMS, although that identifier is not currently rendered by the client.
- The API should provide a deterministic ordering when two entries have the same editorial order.

## HTTP status and error contract

- `200 OK`: valid response, including an empty array.
- `400 Bad Request`: malformed route or unsupported query parameters.
- `404 Not Found`: memorial does not exist, if the API distinguishes missing memorials from empty collections.
- `429 Too Many Requests`: rate limit exceeded.
- `500 Internal Server Error`: unexpected server failure.
- `503 Service Unavailable`: temporary CMS or dependency outage.

Errors should be JSON and safe for public display, for example:

```json
{
  "error": {
    "code": "MEMORIES_UNAVAILABLE",
    "message": "Family memories are temporarily unavailable."
  }
}
```

Do not return stack traces, access tokens, contributor private data, or internal CMS details.

## Content and security requirements

- Validate every item and required field server-side before publishing it.
- Escape or sanitize any rich text before storage or response generation.
- Permit only approved external link domains or validate all links before publication.
- Apply rate limiting and standard security headers.
- Do not expose administrative CMS fields in the public response.
- Support HTTPS only in production.

## Client compatibility and rollout

1. Publish the endpoint with the response contract above.
2. Set `VITE_FAMILY_MEMORIES_API_URL` to the endpoint URL.
3. Verify the production response with the existing `parseFamilyMemoriesResponse` validation.
4. Confirm loading, empty, error, and multiple-memory states in the memorial page.
5. Remove the mock endpoint only after the production endpoint has been verified in a deployed preview.

## Acceptance criteria

- The production endpoint returns all published mock entries with the same four required fields.
- The returned order matches the approved editorial order.
- Paragraph breaks and supported links render as they do in the mock version.
- Invalid entries are rejected before publication and cannot break the entire response silently.
- The endpoint returns the documented status codes and safe JSON errors.
- The memorial page can load the endpoint without code changes beyond environment configuration.
- The mock remains available as a local fallback until production verification is complete.
