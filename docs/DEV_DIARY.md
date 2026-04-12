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
