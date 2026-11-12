# Component Reference

Reuse these components instead of writing new ones. All paths use the `@/` alias (maps to `src/`).

## Core Components

| Component | Import | Purpose |
| --- | --- | --- |
| `DemoBlock` | `@/components/shared/demo-block` | Demo block with collapsible title/description/code — the standard shell for example pages |
| `PageHeader` | `@/components/shared/page-header` | Page header: eyebrow / title / badge / description / actions |
| `Button` | `@/components/ui/button` | variants: primary / outline / ghost / danger / soft / link; sizes: sm / md / lg / icon |
| `Input` `Textarea` `Label` | `@/components/ui/input` | Form inputs |
| `AppSelect` | `@/components/ui/select` | Base UI dropdown (never use a raw `<select>`) |
| `AppSwitch` | `@/components/ui/switch` | Toggle switch |
| `Checkbox` | `@/components/ui/checkbox` | Checkbox |
| `Badge` `StatusBadge` | `@/components/ui/badge` | Badge; `StatusBadge` auto-maps color by `status="success|failed|running|..."` |
| `Card` | `@/components/ui/card` | Card container |
| `FilterBar` | `@/components/shared/filter-bar` | Filter bar layout |
| `toast` | `sonner` | Toast notifications (global Toaster mounted bottom-center) |

## Usage Examples

### Page shell with PageHeader + DemoBlock

```tsx
import { DemoBlock } from '@/components/shared/demo-block'
import { PageHeader } from '@/components/shared/page-header'

export function MyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Examples / Forms"
        title="Form Validation"
        description="Inline validation with TanStack Form."
      />
      <DemoBlock id="basic" title="Basic usage" desc="A simple validated field.">
        {/* demo content */}
      </DemoBlock>
    </div>
  )
}
```

### Button variants

```tsx
import { Button } from '@/components/ui/button'

<Button variant="primary">Submit</Button>
<Button variant="outline">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost" size="icon" aria-label="More" />
```

### StatusBadge

```tsx
import { StatusBadge } from '@/components/ui/badge'

<StatusBadge status="success" />   // green
<StatusBadge status="failed" />    // red
<StatusBadge status="running" />   // amber
```

### Dropdown and toast

```tsx
import { AppSelect } from '@/components/ui/select'
import { toast } from 'sonner'

<AppSelect
  value={value}
  onValueChange={(v) => {
    setValue(v)
    toast.success('Saved')
  }}
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]}
/>
```

## Design Tokens

Use token class names — never hard-code colors.

- Text: `text-ink` (primary) / `text-muted` (secondary) / `text-soft` (weak)
- Borders & backgrounds: `border-line` / `bg-canvas` (page) / `bg-surface` (cards) / `bg-hover`
- Brand color: `bg-brand-600` / `text-brand-600`
- Font sizes: body `text-[11.5px]`, captions `text-[10.5px]`, page titles `text-[24px] font-semibold`

```tsx
<div className="rounded-lg border border-line bg-surface p-4">
  <p className="text-[11.5px] text-ink">Primary text</p>
  <p className="text-[10.5px] text-muted">Caption text</p>
</div>
```
