# How to Apply — AI Experience Labs Opportunities

## Files in this package

```
src/
  data/
    aiLabsOpportunities.ts          ← NEW: 70+ companies seed data
  pages/
    Opportunities.tsx               ← REPLACE existing file
  lib/
    hooks-delta.ts                  ← ADD useDeleteOpportunity to hooks.ts
    api-opportunities-delta.ts      ← REPLACE opportunities section in api.ts
apps/api/prisma/
    SCHEMA_ADDITIONS.md             ← Prisma schema changes + migration steps
```

---

## Step 1 — Copy new files into your repo

```powershell
# From your repo root:

# 1. Copy new data file
Copy-Item "src\data\aiLabsOpportunities.ts"  "path\to\your\repo\src\data\"

# 2. Replace Opportunities page
Copy-Item "src\pages\Opportunities.tsx"       "path\to\your\repo\src\pages\"
```

---

## Step 2 — Update src/lib/api.ts

At the top of the file, add this import (after the existing seed import):
```typescript
import { aiLabsOpportunities } from '@/data/aiLabsOpportunities';
```

Then find the `opportunities: {` block and replace the entire block with the
content from `src/lib/api-opportunities-delta.ts`.

---

## Step 3 — Update src/lib/hooks.ts

Open hooks.ts and check if `useDeleteOpportunity` and `useUpdateOpportunity` exist.
- If `useDeleteOpportunity` is MISSING → add it from hooks-delta.ts
- If `useUpdateOpportunity` is MISSING → add it from hooks-delta.ts
- Both already exist? → skip this step

---

## Step 4 — Backend schema (for live API mode)

Follow the instructions in `apps/api/prisma/SCHEMA_ADDITIONS.md`.

**In mock mode (VITE_USE_API != 'true'), no backend changes are needed** —
the 70+ companies display immediately from the seed data.

---

## What you get

| View | Description |
|------|-------------|
| **Pipeline (Kanban)** | 4 columns: Outreach · Workshop Prep · Workshop Done · Commercial. Cards show rating stars, stage badge, contact, scenarios. Expandable for notes. |
| **All Companies (Table)** | All 70+ rows searchable by company/contact/owner. Filter by stage, owner, rating. Inline edit/delete. |
| **Summary** | Scenario interest counts, pipeline funnel bar chart, owner leaderboard with hot-deal count and avg rating. |
| **Create/Edit Modal** | 13-stage picker, star rating widget, scenario checkboxes, copy-Oracle toggle, follow-up notes, next steps, urgent notes. |

---

## Git push to Render (mock mode — no backend changes)

```powershell
git add src/data/aiLabsOpportunities.ts src/pages/Opportunities.tsx src/lib/api.ts src/lib/hooks.ts
git commit -m "feat: AI Experience Labs opportunities — 70+ companies, 13-stage pipeline, kanban/table/summary views"
git push origin main
```

Vercel will auto-deploy. The page works in mock mode immediately.
