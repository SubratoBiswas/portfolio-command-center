# Scenarios Patch — Apply Instructions

Two files to copy into your repo.

## Files

| File in this zip | Copy to in your repo |
|---|---|
| `src/pages/Opportunities.tsx` | `src/pages/Opportunities.tsx` |
| `src/components/ui/dialog.tsx` | `src/components/ui/dialog.tsx` |

## PowerShell commands

```powershell
# Extract zip to C:\temp\scenarios-patch\ first, then from your repo root:

Copy-Item "C:\temp\scenarios-patch\src\pages\Opportunities.tsx"        ".\src\pages\Opportunities.tsx"
Copy-Item "C:\temp\scenarios-patch\src\components\ui\dialog.tsx"       ".\src\components\ui\dialog.tsx"
```

## What this patch adds

### Opportunities.tsx (full rewrite)
- **5 tabs**: Pipeline (Kanban) | AI Inquiries | Calendar | Action Sheet | Summary
- **Editable AI Scenarios** in the opportunity modal:
  - Selected scenarios shown as removable pills (× to delete)
  - Click a pill label → inline rename input
  - Quick-add chips for predefined scenarios not yet selected
  - Custom text input + "Add" button for anything new
- **Editable Calendar tab**:
  - Add / Edit / Delete events via modal
  - Fields: Company, Date, Time (PST), Session Type, Status, Attendees
- **Editable Action Sheet tab**:
  - Add / Edit / Delete action items via modal
  - Fields: Company, Owner, Scenarios (add/remove), Requirements list (add/edit/remove each), Action notes, Last Demoed
- **13-stage AI pipeline** Kanban with LEGACY_STAGE_MAP fallback
  so old seed data (qualify/discover/propose/negotiate) still displays

### dialog.tsx (X-button fix)
- Modal container is now `flex flex-col max-h-[90vh]`
- `DialogHeader` is `shrink-0` — always visible, never scrolls away
- `DialogBody` is `flex-1 overflow-y-auto` — scrolls internally
- `DialogFooter` is `shrink-0` — always pinned at bottom

## Run

```powershell
npm run dev
```
