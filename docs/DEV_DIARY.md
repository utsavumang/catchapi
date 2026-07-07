# Dev Diary: CatchAPI

---

### Day 1: Monorepo and Tooling Setup

- **Architecture:** Set up a `pnpm` workspace monorepo. Keeps the frontend,
  backend, and shared package in one repo while maintaining strict dependency
  boundaries between them.
- **Orchestration:** Added Turborepo to coordinate builds across packages.
  The shared package always builds before the API or frontend, so one
  `pnpm dev` from the root handles everything in the right order.
- **Guardrails:** Set up Husky for git hooks, lint-staged to only lint changed
  files, and commitlint to enforce conventional commit messages. Using ESLint
  v9's new flat config format.
- **Hurdles:** Git hooks were silently failing on Windows due to CRLF line
  endings. Fixed it globally with `.gitattributes`. Also took a while to
  understand how Turborepo's `dependsOn` actually works. The `^` prefix
  means dependencies first, not run in parallel.

---

### Day 2: Shared Types and Zod

- **Single Source of Truth:** Created a private `@catchapi/shared` package
  that both the backend and frontend consume. Schemas written once in Zod,
  TypeScript types inferred from them. The frontend and backend can never
  disagree on data shapes.
- **Bundling:** Used `tsup` to output both CJS and ESM from the same source.
  Express needs CJS, Vite needs ESM.
- **Hurdles:** TypeScript 6 deprecated the older module resolution strategy.
  Switched to `bundler` resolution. Took some reading to understand why the
  options exist and which one fits which toolchain.

---

### Day 3: App Setup

- **Backend:** Basic Express setup with security middleware, Helmet, CORS,
  rate limiting. Tried to get the structure right from the start rather than
  refactoring later.
- **Frontend:** React with Vite. Tailwind v4 just released and the setup
  changed significantly. No more PostCSS config, it's a Vite plugin now,
  and styles are configured in CSS rather than a JS config file.
- **Hurdles:** Spent time figuring out why `pnpm dev` wasn't building the
  shared package first. Turned out the Turborepo task config needed explicit
  `dependsOn`. It doesn't infer build order from workspace dependencies
  automatically.

---

### Day 4: Auth and State

- **Database:** MongoDB via Mongoose. Passwords are hashed in a pre-save hook
  so there's no way to accidentally save a plain text password.
- **JWTs:** Stateless auth with JWT, no server-side sessions. Register and
  login return a token the client stores and sends with every request.
- **Frontend:** React Hook Form with Zod resolvers so the same schemas
  validate on both client and server. Zustand for global auth state, much
  lighter than Redux for what this app needs.
- **Hurdles:** TypeScript strict mode surfaced a lot of `any` types in catch
  blocks and Axios response handlers. Ended up learning a lot about type
  narrowing just from fixing lint errors.

---

### Day 5: Webhook Ingestion Pipeline

- **The Catcher:** Built the `/w/:urlId` wildcard route that accepts any HTTP
  method. The route is intentionally permissive, no auth, no validation,
  just receive and store.
- **Body Parsing:** Webhooks come in many formats. Had to configure multiple
  body parsers to handle JSON, URL-encoded, plain text, and raw binary, each
  with a size limit.
- **Validation Middleware:** Wrote a generic middleware that takes any Zod
  schema and validates the request body before it reaches the controller.
  Keeps controllers focused on business logic.

---

### Day 6: Management API

- **Endpoints CRUD:** Routes for creating, listing, and deleting webhook
  endpoints. Each endpoint is scoped to the authenticated user.
- **Auth Middleware:** JWT verification middleware that attaches the user to
  the request object. Downstream controllers can trust `req.user` exists.

---

### Day 7: Data Models and Relations

- **Schema Design:** Finalized Mongoose models for User, Endpoint, and
  Payload. Payloads reference an Endpoint, Endpoints reference a User.
- **Cascade Delete:** Deleting an endpoint should delete all its payloads.
  MongoDB doesn't enforce this automatically. Handled it in a Mongoose
  post-delete hook so it fires regardless of what triggers the deletion.
- **TTL Index:** Payloads auto-delete after 30 days via a MongoDB TTL index.
  Keeps storage from growing unbounded without any application-level cleanup
  job.

---

### Day 8: Pagination and Defense

- **Cursor Pagination:** Offset pagination slows down on large collections.
  Built cursor-based pagination instead. Each page returns a cursor the
  client sends to fetch the next page. Consistent performance regardless of
  collection size.
- **Rate Limiting:** Two separate limiters, strict for the management API,
  permissive for the webhook ingestion route which needs to handle traffic
  bursts.
- **Hurdles:** `express-mongo-sanitize` crashed the server on startup.
  Turned out it's incompatible with Express 5 because Express 5 made
  `req.query` a read-only getter. Replaced it with a small custom sanitizer.

---

### Day 9: Logging and Swagger

- **Structured Logging:** Replaced `console.log` with `pino`, structured
  JSON logs in production, pretty-printed in development. HTTP request
  logging via `pino-http`, with high-volume webhook routes excluded from
  access logs.
- **API Docs:** Used `@asteasolutions/zod-to-openapi` to generate Swagger
  UI from the shared Zod schemas. Same schemas that validate requests also
  document the API.
- **Hurdles:** The OpenAPI library crashed at runtime with a cryptic error
  about `schema._zod.parent`. It had been updated for Zod v4 but the project
  uses Zod v3. Downgraded the library to the v3-compatible version.

---

### Day 10: Frontend Foundation

- **shadcn/ui:** Set up shadcn as the component base. Components live in the
  codebase rather than node_modules, so you own them and can modify anything.
  The CLI had issues initialising so ended up using the browser-based preset
  generator. Had to configure the `@` path alias before shadcn would run.
- **Design System:** Settled on a dark professional aesthetic, near-black
  backgrounds, subtle borders, blue accent. Tailwind v4's `@theme inline`
  directive is how you register design tokens now. Spent longer than expected
  getting CSS variables to actually apply to shadcn components. The fix was
  using `@theme inline` in CSS rather than `:root`.
- **Two Fonts:** Inter for UI text, JetBrains Mono for code and payload
  display. The monospace font makes a real visual difference when displaying
  webhook URLs and JSON.

---

### Day 11: Two-Token Authentication

- **The Problem With One Token:** A single long-lived JWT can't be
  invalidated before it expires. If it's stolen, the attacker has access
  until expiry. Needed a way to revoke sessions.
- **The Solution:** Short-lived access token (15 minutes) in memory,
  long-lived refresh token (7 days) in an httpOnly cookie. The access token
  is gone on page refresh, a silent refresh call restores it using the
  cookie. The refresh token can be deleted from the database on logout,
  immediately terminating the session.
- **httpOnly Cookies:** JavaScript can't read them at all. Even if an
  attacker injects a script, they can't steal the refresh token. This was
  the part that took the most time to understand, why the separation matters
  and how the browser handles the cookie automatically.
- **Hurdles:** CORS needed `credentials: true` on both the Express CORS
  config and the Axios instance for cookies to be sent cross-origin between
  localhost:3000 and localhost:5000. Easy to miss.

---

### Day 12: Routing and Guards

- **React Router v7:** Used `createBrowserRouter` with declarative route
  config. Nested routes handle the dashboard layout, the sidebar and navbar
  stay mounted while only the page content changes.
- **Route Guards:** `ProtectedRoute` and `PublicRoute` wrapper components.
  The tricky part was the loading state during silent refresh. Without it,
  authenticated users briefly see the login page on every page refresh before
  the token is restored.
- **Hurdles:** Understanding when to use `<Navigate>` versus `navigate()`.
  `<Navigate>` is a component that redirects during render. `navigate()` is
  a function for imperative navigation after an event. They're not
  interchangeable.

---

### Day 13: Data Fetching Layer

- **Three Layers:** API functions wrap Axios calls. Custom hooks wrap TanStack
  Query. Components call hooks. Each layer has one job and doesn't know about
  the others.
- **TanStack Query:** Handles caching, background refetching, loading and
  error states automatically. The query key is the cache identifier, getting
  this right is important because mutations invalidate queries by key.
- **Axios Interceptor:** Catches 401 responses, silently refreshes the access
  token, then replays the original request. Originally built with a request
  queue to handle simultaneous 401s, simplified to a single-request flow
  after deciding it was unnecessary complexity for this app's scale.
- **Hurdles:** `useInfiniteQuery` took a while to understand. The pages array
  structure isn't obvious, data comes back as nested pages, not a flat array.
  The `select` option in the hook flattens it so components just get a simple
  list.

---

### Day 14: Dashboard and Endpoints

- **Layout:** Persistent sidebar with navigation, user info, and logout at
  the bottom. Only the main content area changes between pages, the sidebar
  stays mounted. Mobile gets an overlay drawer.
- **Endpoints Page:** List with skeleton loading, empty state, and error
  state with retry. Create dialog uses the shared `createEndpointSchema` for
  validation, same schema, same rules, no duplication.
- **Endpoint Cards:** Hover-reveal delete button, copy URL to clipboard,
  relative timestamps. The group hover pattern in Tailwind was new, styling
  a child based on the parent's hover state.

---

### Day 15: Payload Inspector

- **Infinite Scroll:** `useInfiniteQuery` with cursor-based pagination. Load
  more button appends to the existing list rather than replacing it. The
  backend's `hasMore` and `nextCursor` fields map cleanly to TanStack Query's
  `getNextPageParam`.
- **Method Filter:** Toggle buttons for GET, POST, PUT, PATCH, DELETE.
  Changing the filter resets pagination automatically because it changes the
  query key, which TanStack Query treats as a new query.
- **Split Panel:** Clicking a payload opens an inspector panel next to the
  list. Three tabs, Body, Headers, Query Params. JSON displayed in a monospace
  pre block. The layout shifts from single column to two columns when the
  inspector is open.
- **Hurdles:** `useInfiniteQuery`'s `initialPageParam` type must match the
  return type of `getNextPageParam` exactly. Had a type mismatch between
  `null` and `undefined` for the cursor that TypeScript caught but took a
  moment to understand why it mattered.

---

### Day 16: WebSockets

- **Socket.io:** Added real-time payload delivery using Socket.io. Went with
  Socket.io over raw WebSockets mainly for the built-in room management and
  reconnection handling. Both would have worked but Socket.io saved writing
  a lot of infrastructure code.
- **Server Setup:** Had to switch from `app.listen()` to
  `http.createServer(app)` so that Socket.io and Express could share the same
  port. Socket.io attaches to the HTTP server directly, not the Express app.
- **Auth on the Handshake:** WebSocket connections don't work the same as HTTP
  requests with Authorization headers. Socket.io has middleware that runs
  during the handshake, before the connection is established. Verified the JWT
  there and rejected the connection if invalid, so every connected socket is
  guaranteed to have a verified user attached.
- **Broadcasting:** After saving a payload, the `catchWebhook` controller
  emits it to the relevant Socket.io room. Only clients watching that specific
  endpoint receive it. Wrapped the broadcast in a try/catch so a Socket.io
  failure never breaks the HTTP response to the webhook sender.
- **Hurdles:** Socket.io has its own CORS configuration separate from Express.
  WebSocket upgrade requests bypass Express middleware, so the `cors()`
  middleware on the Express app doesn't cover them. Missing this caused every
  frontend connection to be rejected immediately.

---

### Day 17: WebSocket Frontend

- **The Hook:** Wrote a `useEndpointSocket` hook that handles the connection
  lifecycle. Creates the socket on mount, joins the endpoint room, cleans up
  on unmount. The access token goes into Socket.io's `auth` option so it's
  included in the handshake.
- **Cache Integration:** New payloads from the socket get written directly
  into the TanStack Query cache rather than triggering a refetch. The list
  updates instantly without touching the network again. The cache key for
  payloads includes the method filter so filtered views stay correct too.
- **Hook Placement:** Originally put the socket hook in the detail page
  component and passed connection status down through props across multiple
  levels. Moved it into `PayloadList` where the status is actually displayed.
  The page component got noticeably simpler.
- **Reconnect:** Disabled Socket.io's automatic reconnection and handled it
  manually. The reason is that auto-reconnect reuses the token from when the
  socket was created, which could be stale by the time reconnection happens.
  Manual reconnect reads a fresh token from the store each time.
- **Hurdles:** `useCallback` was necessary on the new payload handler.
  Without it, the function reference changed on every render, which triggered
  the socket effect to re-run, which disconnected and reconnected the socket
  constantly. Took a while to notice that was happening.

---

### Day 18: Additional Features

- **Settings Page:** Profile update and password change. The backend routes
  were straightforward. Password change deletes all refresh tokens for that
  user so any other active sessions are terminated immediately, not just the
  current one.
- **JSON Highlighting:** Replaced the plain `<pre>` block in the payload
  inspector with `prism-react-renderer`. Tried doing it with a regex first
  but Prism handles edge cases like escaped quotes inside strings and numbers
  inside string values correctly. The transparent background override is
  needed because every Prism theme ships with its own background color.
- **Payload Export:** Downloads everything currently loaded in the cache as a
  JSON file. Uses the Blob API and a temporary anchor element. Filename
  includes the endpoint name and the current date.
- **Webhook Replay:** Re-sends a captured payload to any URL you specify.
  Done server-side because a direct browser request to an arbitrary URL would
  be blocked by CORS on most servers. The backend strips Railway's proxy
  headers before forwarding so they don't reach the target.

---

### Day 19: Landing Page and Polish

- **Landing Page:** Changed the root route from a redirect to an actual page.
  Used a product mock instead of a screenshot because screenshots go stale and
  a mock built from the same design system classes always looks right and loads
  instantly.
- **Auth Pages:** Changed from a centered card to a split-screen layout. Left
  panel has the branding and a feature list, right panel has the form. Left
  panel hides on mobile. The forms themselves didn't change at all.
- **Page Animations:** Added a fade-in on page mount. `tw-animate-css` was
  already in `package.json` but the import was missing from `index.css`. One
  line fix.
- **Small things:** The empty state icon in the payload list was a different
  size from the one on the endpoints page. The endpoint card hover transition
  had no explicit duration. Small inconsistencies but they were noticeable once
  noticed.

---

### Day 20: Deployment

- **Stack:** MongoDB Atlas for the database, Railway for the API, Vercel for
  the frontend. All free tiers.
- **First Problem:** The build failed on Railway because it couldn't find
  `rateLimiter.middleware`. The file was named `rateLimiter.middleware.ts`
  locally but Git on Windows had tracked a different casing at some point.
  Linux filesystems are case-sensitive. Fixed with a two-step rename through
  a temp filename to force Git to register the case change.
- **Second Problem:** Webhooks sent from Postman were showing up as GET
  requests with no body. The webhook URL in Postman was using `http://`
  instead of `https://`. Railway redirects HTTP to HTTPS with a 301, and most
  HTTP clients convert POST to GET when following that redirect. Changing the
  URL to `https://` fixed it.
- **Third Problem:** The method filter did nothing on the deployed app.
  Switching between GET and POST always returned the same results. The query
  key for the payload list didn't include the method parameter, so all filter
  selections hit the same cache entry. Adding method to the query key fixed it
  immediately.
- **Other:** Had to add `app.set('trust proxy', 1)` so Express could correctly
  read the real protocol behind Railway's proxy. Without it `req.protocol`
  always returned `http` regardless of the actual connection.

---

### Day 21: Wrapping Up

- **Cleanup:** Removed debug console calls from the frontend, mostly socket
  event logs that were useful during development. Removed a comment in
  swagger.ts that was left over from an early debugging session.
- **Review:** Went through the codebase looking for anything out of place.
  The overall structure held up. The shared package idea turned out to be
  worth the setup cost, having the same Zod schemas run on both ends made
  a real difference throughout.
- **Reflection:** The parts that took longest were not the ones expected.
  The two-token auth flow, the TanStack Query infinite query structure, and
  the Socket.io CORS config all required more time than anticipated. The
  actual feature work moved faster once those were understood.

### Day 22: Docs and Readme

- **Dev Diary Docs:** Updated this very DEV_DIARY.md for later days.
- **Readme:** Updated readme to better reflect current state of project.
