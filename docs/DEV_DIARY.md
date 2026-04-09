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
