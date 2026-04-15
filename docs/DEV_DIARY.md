# Development Diary

## Day 1: Root Infrastructure & Guardrails

### 1. Monorepo Architecture

Opted for a `pnpm` workspace over a standard multi-folder MERN setup.

- **The Why:** It allows the React client, Node API, and future CLI tools to share native TypeScript interfaces and Zod schemas without publishing npm packages. `pnpm` was chosen over `npm` or `yarn` to prevent phantom dependencies and enforce strict workspace linking via `pnpm-workspace.yaml`.

### 2. Task Orchestration

Integrated Turborepo (`turbo.json`).

- **The Why:** As the workspace grows, running commands sequentially becomes a bottleneck. Turborepo understands the topological graph of the monorepo (e.g., building `packages/shared` before `apps/api`) and caches build outputs, ensuring we never recompile code that hasn't changed.

### 3. The Enforcers (Husky, Lint-Staged, Commitlint)

Code quality relies on automation, not discipline.

- **Pre-commit:** Husky intercepts commits and runs `lint-staged`. This targets only modified files, running them through Prettier and ESLint. If a file violates rules and cannot be auto-fixed, the commit is aborted.
- **Commit-msg:** Enforces the Conventional Commits standard (e.g., `feat(api): ...`). Migrated to `.commitlintrc.json` to avoid Node module resolution conflicts on Windows.
- **ESLint Flat Config:** Upgraded the root linter to ESLint v9's modern `eslint.config.mjs` flat config to natively support ES Modules.

### 4. Cross-Platform Hardening

- **CRLF vs LF:** Windows uses `CRLF` for line endings, while Unix (and Prettier) strictly use `LF`. This caused silent failures inside Git's bash emulator when executing Husky scripts. Resolved by enforcing `LF` globally via `.gitattributes` and manually converting hook files.
- **Git Recovery:** Learned to use `git reset --soft HEAD~1` to step backward while keeping files staged, and `git reset --hard` to completely nuke a botched commit.

## Day 2: The Shared Domain (Single Source of Truth)

### 1. Scoped Package Initialization

Created the `@catchapi/shared` package to house all validation logic and type definitions.

- **The Why:** The API and React client must perfectly agree on data shapes (like webhook payloads). Centralizing this prevents silent runtime failures caused by out-of-sync types. The package is scoped (`@catchapi`) and explicitly flagged as `"private": true` in `package.json` to prevent accidental leakage to the public npm registry.

### 2. Zod & Build-Time Inference

Built the foundational schemas (`auth.schema.ts` and `endpoint.schema.ts`) using Zod.

- **The Why:** Writing standalone TypeScript interfaces and separate validation logic violates DRY principles and creates synchronization risks. By writing the runtime validation schema in Zod and using `z.infer`, TypeScript automatically extracts the build-time interface. A single source of truth.

### 3. Cross-Environment Bundling (`tsup`)

Configured `tsup` (powered by `esbuild`) to compile the shared TypeScript code.

- **The Why:** The monorepo has diverse consumers. The Node.js Express API might require CommonJS, while the Vite React app strictly uses ES Modules. `tsup` simultaneously bundles the raw TypeScript into `.js` (CJS), `.mjs` (ESM), and `.d.ts` (Type Declarations) formats, ensuring universal compatibility across the workspace.

### 4. Architectural Friction & Upgrades

The build process exposed several strictness and bleeding-edge versioning constraints that required global configuration updates.

- **TypeScript 6.0 Module Resolution:** The `tsup` declaration build crashed because TypeScript 6 aggressively deprecated the legacy `node10` module resolution. Upgraded the root `tsconfig.base.json` to use `"moduleResolution": "bundler"`, aligning the workspace with the modern standard for bundler-driven environments.
- **Strict Zod Records:** `z.record(z.any())` failed TS checks. Under modern strict typing, Zod requires explicit key types for records. Refactored the arbitrary payload schema to `z.record(z.string(), z.any())`.
- **ESLint TS Integration:** The Git hook crashed because the root ESLint config didn't understand TypeScript syntax. Installed `typescript-eslint` and refactored the Flat Config (`eslint.config.mjs`) to natively merge standard JS recommended rules with TS recommended rules using the new `tseslint.config()` wrapper.

## Day 3: Application Scaffolding & The Turborepo Pipeline

### 1. The API Shell (Express)

Scaffolded the barebones Express server in `apps/api`.

- **The Why:** We separated the API logic from the monorepo root. Implemented early security middleware (`helmet` for HTTP headers, `cors` for cross-origin boundaries). Kept the server minimal to prep for database connections.

### 2. The Frontend Shell (Vite + React + Tailwind v4)

Bootstrapped the React client using Vite instead of Create React App.

- **The Why:** Vite uses native ES Modules, meaning zero bundling during development. Server start times dropped to milliseconds.
- **The Bleeding-Edge Friction:** Attempted to install Tailwind via the traditional PostCSS pipeline but hit a wall. Tailwind just released v4, which completely deprecates `tailwind.config.js` and PostCSS in favor of a lightning-fast, CSS-first Vite plugin (`@tailwindcss/vite`). Pivoted the architecture to the modern v4 standard.

### 3. Blurring the Boundary (The Monorepo Win)

Wired the React app to import the `@catchapi/shared` Zod schemas directly.

- **The Why:** Historically, frontend form validation and backend route validation were duplicated logic. By linking the Vite app to the monorepo workspace, the React client now executes the exact same mathematical validation rules as the Express server, with zero network latency.

### 4. The Orchestration Pipeline

Updated `turbo.json` to orchestrate the entire workspace with a single `pnpm run dev` command.

- **The Why:** Opening three terminals to build the shared package, start the API, and start the client is tedious and error-prone.
- **The Guardrail:** Added `"dependsOn": ["^build"]` to the `dev` task. This acts as a topological lock: Turborepo looks at the dependency graph and guarantees that the `@catchapi/shared` Zod schemas are fully compiled _before_ it allows the Express and Vite servers to boot.

## Day 4: The Identity Engine (End-to-End Auth)

### 1. The Zero-Trust Database Layer (Backend)

Integrated Mongoose and MongoDB, defining the User schema.

- **The Why (Fat Models, Skinny Controllers):** Instead of hashing passwords in the routing controller, I utilized a Mongoose `pre('save')` hook with `bcryptjs`. This means the database structurally refuses to save plain-text passwords. Even if a junior dev writes a flawed registration controller in the future, the database protects itself.

### 2. Stateless Authentication (Backend)

Built the `/register` and `/login` controllers using JSON Web Tokens (JWT).

- **The Why:** Opted for stateless JWTs over stateful memory sessions. The server doesn't have to keep a ledger of who is logged in; it simply verifies the cryptographic signature on incoming requests. This makes the API infinitely horizontally scalable. Both controllers ingest `req.body` through the shared Zod schemas to block malicious payloads at the boundary.

### 3. Smart Forms (Frontend)

Implemented `react-hook-form` paired with `@hookform/resolvers/zod` for the React UI.

- **The Why:** Standard React forms cause massive re-renders on every keystroke. React Hook Form minimizes renders, and the Zod resolver acts as a translation layer. The frontend now perfectly enforces backend constraints (like password length or email formatting) before the user even clicks submit.

### 4. Global State & Network Interceptors (Frontend)

Replaced Redux with `zustand` for lightweight global state, and built an Axios interceptor.

- **The Why:** Once a user logs in, every subsequent request needs the JWT token. Instead of manually attaching it to every fetch call, the Axios interceptor automatically dips into the Zustand global state, retrieves the token, and attaches it as a `Bearer` header right before the request leaves the browser.

### 5. Strict TypeScript Friction

The linter blocked commits due to `any` types in `catch` blocks and mismatched Mongoose `ObjectId` types.

- **The Fix:** TypeScript caught genuine runtime risks. Replaced lazy `catch (error: any)` blocks with strict `if (error instanceof Error)` and `isAxiosError` type guards. Converted Mongoose `ObjectId` types safely using `.toString()` before JWT generation. The pipeline successfully prevented un-typed code from entering the main branch.
