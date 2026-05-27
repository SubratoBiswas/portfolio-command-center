# How to Apply — AI Experience Labs v2

## Files in this package

```
src/
  pages/  Opportunities.tsx     ← REPLACE (one file, complete page)
  lib/    api-fix.ts            ← Instructions for api.ts fix
```

## Step 1 — Copy Opportunities.tsx

```powershell
# From C:\temp\ai-labs-v2\ai-labs-v2\
Copy-Item "src\pages\Opportunities.tsx" "C:\path\to\your-repo\src\pages\"
```

## Step 2 — Fix api.ts (the root cause of 15-company issue)

Open `src/lib/api.ts` in VS Code.

### 2a — Add import (line ~8, after `import * as seed`):
```typescript
import { aiLabsOpportunities } from '@/data/aiLabsOpportunities';
```

### 2b — Find and replace the opportunities block:
Press Ctrl+F and search for `opportunities: {`
Select from that line down to the closing `},` of the opportunities object (~30 lines).
Replace with the full block from `src/lib/api-fix.ts`.

## Step 3 — Verify aiLabsOpportunities.ts is in src/data/

If you applied v1 already, this file is already there.
If not, also copy from the v1 zip: `src/data/aiLabsOpportunities.ts`

## Step 4 — hooks.ts (check useDeleteOpportunity exists)

Search your hooks.ts for `useDeleteOpportunity`. If missing, add:
```typescript
export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.opportunities.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: k.opportunities }); },
  });
}
```

## Step 5 — Run and verify

```powershell
npm run dev
```

You should now see:
- Header: "70+ companies · X hot · X in negotiation"
- Pipeline tab: cards appearing in all 4 Kanban columns
- AI Inquiries tab: full searchable/filterable table with expandable rows
- Calendar tab: past workshops history + upcoming scheduled sessions
- Action Sheet tab: 10 active accounts with scenario requirements + action items
- Summary tab: funnel + owner leaderboard

## Step 6 — Push to GitHub

```powershell
git add src/pages/Opportunities.tsx src/lib/api.ts
git commit -m "feat: add Calendar, AI Inquiries, Action Sheet tabs + fix data loading"
git push origin main
```
