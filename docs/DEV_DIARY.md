# Dev Diary: CatchAPI

### Day 1: Monorepo & Tooling Setup

- **Architecture:** Set up a `pnpm` workspace. Better than npm/yarn for strict dependency linking and avoiding phantom dependencies.
- **Orchestration:** Added Turborepo. Caching builds saves a ton of time (e.g., won't recompile the shared package if only the frontend changed).
- **Guardrails:** Hooked up Husky, lint-staged, and commitlint. Upgraded to ESLint v9's flat config.
- **Hurdles:** Got stuck on a Windows vs. Unix line-ending issue (CRLF vs LF) that broke the Git hooks. Fixed it globally via `.gitattributes`.

### Day 2: Shared Types & Zod

- **Single Source of Truth:** Created a private `@catchapi/shared` package.
- **Validation:** Wrote the base schemas in Zod. Exporting inferred TS types means the frontend and backend will never fall out of sync on data shapes.
- **Bundling:** Used `tsup` to bundle the package into CJS and ESM formats so both Express and Vite can consume it natively.
- **Hurdles:** Hit a wall with TS 6 deprecating `node10` module resolution; updated to `bundler`. Also had to strict-type Zod records instead of using lazy `z.any()`.

### Day 3: App Scaffolding

- **Backend:** Spun up a barebones Express app. Added basic security middleware (Helmet, CORS).
- **Frontend:** Bootstrapped React with Vite.
- **Tailwind v4:** Ran into setup friction because Tailwind just dropped v4, which nukes `postcss` in favor of a Vite plugin. Adapted to the new CSS-first standard.
- **Pipeline:** Wired Turborepo to ensure the shared package builds _before_ the API and Client boot up. One `pnpm run dev` command handles everything.

### Day 4: Auth & State

- **Database:** Hooked up MongoDB via Mongoose. Used a pre-save hook for `bcrypt` so the DB structurally refuses to save raw passwords.
- **JWTs:** Built stateless `/register` and `/login` routes. Kept it scalable without memory sessions.
- **Client State:** Used React Hook Form + Zod resolvers on the frontend to match backend validation perfectly. Swapped Redux for Zustand to keep global state light.
- **Network:** Wrote an Axios interceptor to automatically grab the JWT from Zustand and inject it into headers. Fixed a bunch of strict TS errors around `any` in catch blocks.

### Day 5: Webhook Ingestion Pipeline

- **The Catcher:** Built the `/w/:urlId` wildcard route.
- **Parser Middleware:** Webhooks send weird data. Had to configure Express to safely parse `raw`, `json`, `urlencoded`, and `text` bodies up to 512kb.
- **Zod Middleware:** Wrote a generic Express middleware that takes any Zod schema and validates `req.body`/`req.query` before it hits the controller. Keeps controllers clean.

### Day 6: Management API

- **Endpoints CRUD:** Built the routes for creating, fetching, and deleting webhook endpoints.
- **Auth Middleware:** Wrote the guard that verifies the JWT, fetches the user, and attaches `req.user` to the Express request object so endpoints are properly tied to the logged-in user.

### Day 7: Data Models & Relations

- **Schema Design:** Finalized the Mongoose models for `Endpoint` and `Payload`.
- **Relational Logic:** Made sure Payloads reference an Endpoint ID, and Endpoints reference a User ID. Kept it strictly normalized.
- **Controller Logic:** Wired the ingestion engine to actually save the incoming headers, method, query, and body into the Payload collection.

### Day 8: Pagination & Defense Layer

- **Cursor Pagination:** Ditched standard offset pagination (`skip/limit`) because it gets insanely slow on large collections. Built an O(1) cursor-based system using MongoDB's `$lt` operator on timestamps and the "N+1 query" trick to detect if there's a next page.
- **Rate Limiting:** Added `express-rate-limit`. Put a strict limit on the management UI to prevent brute force, and a high-capacity limit on the webhook ingestion route to handle traffic bursts without getting DDoS'd.
- **NoSQL Defense:** Locked down the Mongoose query builders with strict TS interfaces so users can't pass MongoDB operators via the URL query string.

### Day 9: Observability & Swagger

- **JSON Logging:** Ripped out `console.log`. Swapped it for `pino` and `pino-http` for asynchronous, structured JSON logging that won't block the Node event loop.
- **Docs:** Used `@asteasolutions/zod-to-openapi` to generate Swagger UI directly from the shared Zod schemas (SSOT).
- **Monorepo Hell:** Spent hours fighting a dual-instance bug where Node loaded two separate versions of Zod into RAM.Purged the lockfile, externalized `zod` in `tsup`, downgraded to v7 of the bridge, and finally got the UI rendering perfectly.
