# Instructions feature — current state & migration plan

## Current state (pre-presentation workaround)

### Data model
```
instructions        { id, title, body, imageUrl, wasteTypeId, isActive, createdAt, updatedAt }
instruction_steps   { id, instructionId, text, isActive, createdAt, updatedAt }
```

No `order` column on `instruction_steps`. No image support.

### Step order workaround
`instructions.body` (nullable text, previously unused) stores step order as JSON:
```json
{ "stepOrder": ["step-id-1", "step-id-2", "step-id-3"] }
```
- Written on every drag-and-drop reorder via `PUT /api/instructions/:id { body: "..." }`
- Read at component mount via `parseStepOrder(instruction)` in `InstructionStepsSection`
- Mobile app does **not** read `body` — fully backward compatible
- Reversible: drop the JSON from `body` or migrate to proper column at any point

### Mobile layout
Mobile app renders steps as alternating rows:
- Even index (0, 2, …): image block → text block
- Odd index (1, 3, …): text block → image block
- Last step is always "Depositar en contenedor" (bin placement), locked / not editable from web

Max **4 user-defined steps** per instruction (enforced in UI).

### Admin UI
- `InstructionStepsSection` shows DnD sortable list (left) + mobile phone frame preview (right)
- Drag handle via `@dnd-kit/sortable`; order saved to `instructions.body` on drop
- Max 4 steps enforced; 5th slot replaced with amber warning
- Add step: inline input + Enter or button
- Edit step: inline input with save/cancel
- Delete step: AlertDialog confirmation

---

## Post-presentation migration plan

### 1. Add `order` column to `instruction_steps`

```sql
ALTER TABLE instruction_steps ADD COLUMN "order" integer NOT NULL DEFAULT 0;
```

Backfill from existing `body` JSON per instruction:
```sql
-- pseudocode; run as migration script
UPDATE instruction_steps SET "order" = idx
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "instructionId" ORDER BY "createdAt") - 1 AS idx
  FROM instruction_steps
) ranked
WHERE instruction_steps.id = ranked.id;
```

Then update backend `GET /api/instruction-steps` to `ORDER BY "order" ASC`.

### 2. Add `imageUrl` column to `instruction_steps`

```sql
ALTER TABLE instruction_steps ADD COLUMN "image_url" text;
```

Set up Supabase Storage bucket `instruction-step-images` (public read, authenticated write).

Backend `PUT /api/instruction-steps/:id` should accept `imageUrl`.

Frontend: add image upload in `SortableStepRow` — click image placeholder → file picker → upload to Storage → store URL.

### 3. Bin type auto-step

`map_waste_type_bin_types` table maps `waste_type_id + university_id → bin_type_id`.

The locked last step could be generated dynamically:
- Fetch bin type for the instruction's waste type + current university
- Show bin type name/color/image in the locked step
- No extra DB column needed; purely computed

### 4. Clean up `instructions.body`

Once `order` column is live and backfilled, strip step-order JSON from `body`.
Either null it out or repurpose the field for actual instruction body text (for future rich-text support).

---

## Files involved

| File | Role |
|------|------|
| `frontend/src/modules/admin/components/InstructionStepsSection.tsx` | DnD step editor + mobile preview |
| `frontend/src/shared/pages/InstructionsPage.tsx` | Accordion page; passes `instruction` object down |
| `frontend/src/modules/admin/services/InstructionsService.ts` | `parseStepOrder`, `encodeStepOrder`, `InstructionPayload.body` |
| `frontend/src/modules/admin/services/InstructionStepsService.ts` | Step CRUD |
| `backend/src/modules/instructions/routes.ts` | `PUT /:id` already accepts `body` |
| `backend/src/modules/instruction-steps/routes.ts` | Will need `imageUrl` + `order` write support post-migration |
