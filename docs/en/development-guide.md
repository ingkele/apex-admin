# Development Guide

Conventions for adding pages and features to Apex Admin.

## Routing: The Three-Place Sync Rule

Adding a new page requires syncing **three places**, or the page will not appear in the sidebar / TypeScript will fail:

1. **Route file** — `src/routes/_auth/examples/<group>/<page>.tsx`, with the route path string strictly matching the file location:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/examples/<group>/<page>')({
  component: Page,
})

function Page() {
  return <div>{/* ... */}</div>
}
```

2. **`src/app.config.ts`** — add the icon key to the `NavIcon` union type, and add `{ label, to, icon }` to the matching group's `children` in `NAV_GROUPS`.
3. **`src/components/layout/sidebar.tsx`** — import the lucide icon and add the same key to the `ICONS` map.

## Recipe: Add a New Demo Page (7 Steps)

1. Create `src/routes/_auth/examples/<group>/<page>.tsx`.
2. Page shell: `PageHeader` (eyebrow = `"Examples / <group>"`) plus one or more `DemoBlock`s.
3. Use existing components and design tokens (see `component-usage.md`).
4. Do the three-place sync (route + app.config.ts + sidebar.tsx).
5. If you created a new directory, add it to `allowed_dirs` in `guardai.yml`.
6. `pnpm typecheck && pnpm build` must both pass (build refreshes the route tree).
7. Add `data-testid` to interactive elements and cover the page with a Playwright e2e script + screenshots into `outputs/`.

## Data Layer

- **Mock/live dual mode**: `src/mocks/` provides demo data; `src/api/` is the real API layer. Example pages must be self-contained with mock data — never issue real requests from demo pages.
- **Race conditions on concurrent requests**: use a monotonically increasing `reqSeq` counter and discard stale responses. See `src/routes/_auth/examples/vxe-table/remote.tsx` for the reference pattern.

## Testing

- E2E uses playwright-cli. Script shape: `async () => { ... }` with the global `page`, assertions collected via `t(name, fn)` into a results array.
- Login chain: goto any protected page → redirected to `/login` → click the login button → `waitForURL` dashboard → goto the target page.
- Known pitfalls: `getByRole` name matching is **substring** based (use `{ exact: true }` or `.first()` on collisions); toasts duplicating page text cause strict-mode collisions; drag coordinate math must account for the handle width.

## Red Lines (CI/Gate Will Block)

- Never hand-edit `routeTree.gen.ts`.
- Never create ad-hoc directories (`utils2`, `helpers`, `common`, ...) — new files go into the established structure listed in `guardai.yml` `allowed_dirs`.
- `guardAI check --mode changed` must report 0 violations before commit (the pre-commit hook enforces this).
- Use pnpm only; do not add new dependencies without asking first.
- Extract magic strings/numbers (URLs, ports, thresholds) into config or constants.
