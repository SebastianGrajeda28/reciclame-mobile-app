# Education Domain

## Client services

- content-related mobile flows
- `AdminContentService`
- `FactsUI`
- `ContentUI`

## Current backend ownership

### Tables in `public`
- `educational_content`
- `instructions`
- `instruction_steps`
- `fun_facts`
- `waste_types` as content support taxonomy

### Functions
- `public.get_educational_content_for_sync()`
- `public.get_educational_content_by_category(...)`
- `public.get_educational_categories()`

### Policies
- RLS on `fun_facts`
- RLS on `instructions`
- RLS on `instruction_steps`
- RLS on `waste_types`

## Current source files

### Migrations
- `20260601002000_educational_content.sql`
- `20260612020000_education_instruction_step_images.sql`
- `20260612021000_education_content_admin_policies.sql`

## Problems today

- content contracts are split between `educational_content` and the newer admin-managed tables
- admin access policies for content are defined, but the domain story is not documented in one place

## Target organization

For future contracts, prefer an `education` schema:
- `education.get_content_for_sync()`
- `education.get_categories()`
- `education.active_fun_facts_v`
- `education.instructions_with_steps_v`
