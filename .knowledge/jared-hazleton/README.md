# Jared Hazleton biography and supporting documents

This folder holds reference materials for writing and verifying Jared Earl
Hazleton's biography: biographical documents, obituaries, interviews, career
records, family-provided context, and research notes. Add source files here as
they become available.

## Available collections

- [Family research workspace](genealogy/README.md): structured people and claims,
  family groups, research log, and direct gravestone review with date conflicts.
- [Smith and Hazleton family summary](Smith-Hazleton-Family-Summary.md): combined
  research findings, the new Smith–Goode maternal connections, and unresolved questions.
- [Smith History Photos — Photomyne archive](photomyne-smith-history/README.md):
  39 downloaded family photographs, 36 original captions, an offline searchable
  gallery, source metadata, and family-history leads. Retrieved September 14, 2026.

## Adding materials

- Use descriptive filenames, such as `jared-hazleton-biography.pdf` or
  `1986-04-02-interview-transcript.md`. Include dates only when known.
- Preserve original documents. Keep transcriptions and editorial notes in
  separate files, identifying the original source and relevant pages.
- Record each source's title, author or contributor, document date, origin URL
  or filename, and the facts it supports. Mark uncertain or conflicting facts
  for review before publishing.
- This is a repository reference folder. It is not a website upload endpoint;
  repository access determines who can read committed materials.

## Relationship to website content

| Content | Existing location and evidence |
| --- | --- |
| Memorial biography prose | `client/src/memorial/components/sections/Biography.tsx:47`; rendered by `client/src/memorial/MemorialHome.tsx:110` |
| Selected published works | `client/src/memorial/components/sections/Publications.tsx:6`; rendered by `client/src/memorial/MemorialHome.tsx:112` |
| Family memories | `client/public/mock-api/family-memories.json`; default endpoint in `client/src/lib/family-memories-api.ts:51` |
| Memory record fields | `client/src/lib/family-memories-api.ts:1`: `personName`, `personPronouns`, `relationshipToJared`, and `body` |
| Memory display | `client/src/memorial/components/sections/FamilyMemories.tsx:114`; paragraphs and HTTP(S) Markdown links are rendered at lines 130 and 7 |
| Memorial structured data | `client/src/memorial/MemorialHome.tsx:19` |

Adding a document here does not update the biography or create a visitor-facing
link. The current biography uses inline JSX; the memories loader fetches its
configured endpoint or the public JSON file, not this folder. See the code
references above.

For documents intended for public download, the suggested future location is
`client/public/documents/jared-hazleton/`, with explicit links added to the
appropriate site section. That directory and a document listing are not created
by this reference-folder setup. The Vite application root is `client/`, and build
output defaults to `target/` (`vite.config.ts:100`).

## Evidence and verification

The existing [memorial architecture notes](../entities/memorial-site/architecture.md)
describe the page at a high level. This README adds source-storage and editing
guidance without changing application behavior or entity metadata.

The focused validation command is:

```powershell
npm run test:run -- client/src/lib/family-memories-api.test.ts
```

Those tests cover the default memories endpoint, fetching, a CMS response
envelope, and malformed records (`client/src/lib/family-memories-api.test.ts:19`).
They do not establish historical accuracy. Biography and document-storage
guidance is based on code/configuration inspection; biographical claims should
be verified against the supporting documents before editing published text.
