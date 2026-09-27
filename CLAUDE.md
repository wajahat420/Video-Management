# node-api

Express + TypeScript + Prisma 7 (Postgres) API.

## Stack

- Express 4, TypeScript, CommonJS output (`tsc`), dev via `tsx`/`nodemon` (`npm run dev`)
- Prisma 7 with driver adapters (`@prisma/adapter-pg`), client generated to `src/generated/prisma` (gitignored)
- Env loaded via `import 'dotenv/config'` as the **first** import in `src/server.ts` — this must stay first, since `src/lib/prisma.ts` reads `process.env.DATABASE_URL` at module load and imports execute before any other top-level code

## Structure

```
src/
  config/         # central config (src/config/index.ts) — all tunables (limits, ports, storage paths) live here, not scattered as magic numbers
  routes/         # express.Router() per resource, mounted in routes/index.ts under /api
  controllers/    # thin HTTP layer, no business logic
  services/       # business logic + Prisma calls
  middlewares/
  types/
```

## Video upload feature

- Multipart upload via `multer` (disk storage) → `src/middlewares/upload.middleware.ts`
- Metadata + thumbnail extraction via `fluent-ffmpeg` using bundled `ffmpeg-static`/`ffprobe-static` binaries (no system ffmpeg required)
- Files stored locally under `storage/` (gitignored), keyed like S3 (`videos/<id>/original.<ext>`) so a future swap to real S3 only touches `src/services/storage.service.ts`
- Processing is synchronous: the upload request blocks until ffprobe + thumbnail finish, then responds with the full record (`READY` or `FAILED`)

## Postman collection

`postman/node-api.postman_collection.json` (+ `postman/node-api.postman_environment.json`) mirrors the current API surface.

**Whenever routes or controllers change (endpoints added/removed/renamed, params changed), update the Postman collection to match.** A `PostToolUse` hook (`.claude/settings.json`) reminds Claude of this automatically when it edits files under `src/routes/` or `src/controllers/`.

## Database changes require permission

**Never insert, update, or delete data in the database (via `psql`, Prisma Client calls, scripts, etc.) without first asking the user for explicit permission.** This applies to ad-hoc test-data cleanup too, not just application code paths. Schema migrations (`prisma migrate dev`) that the user has already asked for are fine, but writing/modifying/deleting rows is not — always ask first.

## Commands

- `npm run dev` — start dev server (nodemon + tsx)
- `npm run build` — typecheck + compile to `dist/`
- `npx prisma migrate dev --name <name>` — create/apply a migration after schema changes
- `npx tsc --noEmit` — typecheck only
