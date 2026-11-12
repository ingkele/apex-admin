# Apex Admin — Usage Guide

Apex Admin is a production-ready admin dashboard template. Pure frontend SPA with a mock/live dual data layer.

**Stack**: React 19 + TypeScript + TanStack Router (file-based routing) + TanStack Query/Table/Form + Base UI + Tailwind CSS v4 + Vite + pnpm.

## Quick Start

```bash
npm create apex-admin@latest my-admin   # scaffold a new project
cd my-admin
pnpm install
pnpm dev        # dev server at http://localhost:5180
```

## Common Commands

```bash
pnpm dev          # start dev server (port 5180)
pnpm build        # production build (also regenerates the route tree)
pnpm typecheck    # TypeScript check
pnpm preview      # preview the production build
```

## Build Notes

- `src/routeTree.gen.ts` is **auto-generated** by the Vite plugin during `dev`/`build`. Never edit it by hand; the `tsr` CLI is not available.
- If typecheck reports `not assignable to keyof FileRoutesByPath`, the route tree is stale — run `pnpm build` first, then `pnpm typecheck`.

## Project Structure

```
src/
  app.config.ts        # app config + NAV_GROUPS sidebar tree + NavIcon type
  main.tsx             # entry: Router / QueryClient / ThemeEngine / Toaster
  routeTree.gen.ts     # [auto-generated, do not edit]
  routes/              # file-based routes (TanStack Router conventions)
    _auth/             # route segment with login guard + sidebar layout
      examples/        # demo pages (grouped in subfolders: vxe-table/, captcha/, form/, ...)
  components/
    ui/                # base controls (Base UI wrappers): button/input/select/switch/badge/card/...
    shared/            # business-shared parts: demo-block/page-header/filter-bar/stat-card/...
    layout/            # layout shell: sidebar/topbar/tab-bar
  api/  stores/  mocks/  lib/  styles/
guardai.yml            # guardAI code-structure gate config
```

## AI-Coding Friendly

- `AGENTS.md` — full project manual for AI coding tools (Chinese).
- `llms.txt` — capability index for LLM tooling.
- guardAI gate runs on pre-commit and CI: structure / duplication / secret checks.

See `docs/en/component-usage.md` for the component reference and `docs/en/development-guide.md` for routing conventions and the new-page recipe.
