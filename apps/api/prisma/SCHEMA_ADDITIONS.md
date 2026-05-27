# Prisma Schema — Opportunity Model New Fields

Add these fields to the `Opportunity` model in `apps/api/prisma/schema.prisma`:

```prisma
model Opportunity {
  // ... your existing fields stay as-is ...

  // ─── AI Experience Labs fields (add these) ───────────────────────────────
  aiStage             String    @default("reply_sent")   // 13-stage AI pipeline key
  contactName         String?
  contactTitle        String?
  contactEmail        String?
  trinamixOwner       String?                             // free-text owner name
  dealRating          Int       @default(0)              // 0–5 stars
  copyOracle          Boolean   @default(false)
  emailOwner          String?
  interestedScenarios String    @default("[]")           // JSON array stored as string
  followUpNotes       String?   @db.Text
  nextSteps           String?   @db.Text
  urgentNotes         String?
  lastReviewed        DateTime?
}
```

## Migration Steps

Run in your project root (PowerShell or terminal):

```bash
# 1. Edit schema.prisma to add the fields above
# 2. Push the schema to the database
npx prisma db push

# 3. Restart the API (Render will auto-redeploy on git push)
```

## NestJS — Update CreateOpportunityDto

In `apps/api/src/opportunities/dto/create-opportunity.dto.ts`, add:

```typescript
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';

@IsOptional() @IsString() aiStage?: string;
@IsOptional() @IsString() contactName?: string;
@IsOptional() @IsString() contactTitle?: string;
@IsOptional() @IsString() contactEmail?: string;
@IsOptional() @IsString() trinamixOwner?: string;
@IsOptional() @IsInt() @Min(0) @Max(5) dealRating?: number;
@IsOptional() @IsBoolean() copyOracle?: boolean;
@IsOptional() @IsString() emailOwner?: string;
@IsOptional() @IsString() interestedScenarios?: string;  // JSON string
@IsOptional() @IsString() followUpNotes?: string;
@IsOptional() @IsString() nextSteps?: string;
@IsOptional() @IsString() urgentNotes?: string;
@IsOptional() lastReviewed?: Date;
```

The `BaseCrudService` will handle all CRUD automatically once these are in the DTO.

## Seed the Production DB

After migration, run the seed script to populate the 70+ AI Experience Labs companies:

```bash
# In apps/api/ — you can create a seed script or import via REST
# All companies are in src/data/aiLabsOpportunities.ts (frontend seed)
# For production seeding, call POST /opportunities for each company via the API
```
