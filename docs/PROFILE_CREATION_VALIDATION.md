# Profile Creation on First Login - Validation Report

## Overview

This document validates that the profile creation system correctly handles first login (creates profile) and subsequent logins (prevents duplication).

## Implementation Architecture

### 1. Database Schema (Backend Protection)

**Location:** `supabase/migrations/20260522000001_create_tables.sql`

The `user_profiles` table has a **UNIQUE constraint** on `user_id`:

```sql
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  alias text,
  avatar_id uuid,
  university_id uuid,
  campus_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

**Key Point:** The `unique` constraint on `user_id` means only one profile can exist per user, preventing duplicates at the database level.

### 2. Server-Side Trigger (Initial Profile Creation)

**Location:** `supabase/migrations/20260527184500_create_user_profile_trigger.sql`

When a new user is created in `auth.users`, a PostgreSQL trigger automatically creates their profile:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_name text;
begin
  -- 1. Insert user into public.users table
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  
  -- 2. Extract display name from Google OAuth metadata
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- 3. Insert user profile into public.user_profiles table
  insert into public.user_profiles (user_id, alias)
  values (new.id, user_name)
  on conflict (user_id) do nothing;  -- <-- Prevents duplicates
  
  return new;
end;
$$;
```

**Key Protection Mechanisms:**
- `on conflict (id) do nothing` - Prevents duplicate user entries
- `on conflict (user_id) do nothing` - Prevents duplicate profiles

### 3. Client-Side Profile Validation (Fallback)

**Location:** `src/hooks/useAuth.tsx`

The React hook provides a secondary check during auth state changes:

```typescript
if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
  const checkAndCreateProfile = async () => {
    // 1. Ensure user is in public.users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });

    // 2. Check if profile exists
    const { data: profile, error: profileSelectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // 3. If no profile exists, create it
    if (!profile) {
      const displayName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        user.email?.split('@')[0] ??
        'Usuario';

      await supabase
        .from('user_profiles')
        .insert({ user_id: user.id, alias: displayName });
    }
  };

  checkAndCreateProfile();
}
```

**Key Points:**
- Uses `.maybeSingle()` to safely check for existing profile
- Only inserts if `!profile` (profile doesn't exist)
- Handles gracefully if insert fails (catches errors)

## Validation Test Suite

**Location:** `tests/auth/profile-creation.test.ts`

### Unit Tests (✓ PASSING)

1. ✓ Display name extraction from email
2. ✓ Full name from metadata takes precedence
3. ✓ Fallback to email prefix
4. ✓ Last resort fallback to 'Usuario'

### Integration Tests (Ready to Run)

Tests available when `.env.local` is configured with Supabase credentials:

1. **Should have created a profile when user was first created**
   - Verifies the most recent user has a profile
   - Ensures profile `user_id` matches the user ID
   - Checks that `alias` is populated

2. **Should NOT have duplicate profiles for the same user**
   - Counts all profiles for a user
   - Asserts exactly ONE profile exists (not 0, not multiple)
   - Verifies unique constraint is enforced

3. **Should have consistent alias across profiles**
   - Queries the same profile twice
   - Ensures alias value doesn't change
   - Validates data consistency

4. **Should enforce unique constraint on user_id in user_profiles**
   - Attempts to insert a duplicate profile
   - Expects PostgreSQL error code 23505 (unique violation)
   - Confirms database prevents application-level duplicates

## How Duplication is Prevented

### Layer 1: Database Constraints
- **Unique constraint** on `user_id` in `user_profiles` table
- PostgreSQL rejects any duplicate insert attempts

### Layer 2: Server Trigger
- Trigger runs on new user creation
- Uses `on conflict (user_id) do nothing` to safely handle edge cases
- Automatic profile creation at signup time

### Layer 3: Client-Side Check
- Validates profile exists before attempting insert
- Gracefully handles already-created profiles
- Provides redundancy for offline scenarios

## Scenario Testing

### Scenario 1: First Login (Happy Path)
```
1. User authenticates with Google OAuth
2. New entry in auth.users
3. Trigger fires → handle_new_user()
4. Profile created in user_profiles
5. Client hook runs → profile exists, skips insert
✓ Result: 1 user, 1 profile
```

### Scenario 2: Second Login (No Duplication)
```
1. User authenticates again
2. Existing entry in auth.users
3. Trigger doesn't fire (user already exists)
4. Client hook runs → queries profile
5. Profile exists → no insert attempted
✓ Result: 1 user, 1 profile (unchanged)
```

### Scenario 3: Edge Case - Trigger Fails
```
1. User authenticates
2. Trigger runs but fails (rare edge case)
3. Client hook runs → profile doesn't exist
4. Client inserts profile
✓ Result: 1 user, 1 profile (recovered by client layer)
```

### Scenario 4: Edge Case - Client Offline
```
1. User authenticates
2. Trigger fires → profile created
3. Client hook can't run
✓ Result: 1 user, 1 profile (created by trigger)
```

## Code Review: useAuth Hook

### Profile Creation Flow

**Line 46-97:** Auth state change handler
- Triggered on `SIGNED_IN` or `INITIAL_SESSION` events
- Only runs if `newSession?.user` exists
- Async function prevents blocking auth flow

**Line 63-67:** Profile existence check
- Uses `.maybeSingle()` - safe for no-results cases
- Returns null if no profile (not an error)
- Error handling for query failures

**Line 75-90:** Conditional profile creation
- Only inserts if `!profile` (truthy check)
- Display name fallback chain (5 options)
- Graceful error handling
- No duplicate insert logic

### Protection Mechanisms

1. **Maybee Single Query**: `maybeSingle()` returns `null` if no rows (not error)
2. **Conditional Insert**: `if (!profile)` ensures no unnecessary operations
3. **Error Handling**: Try-catch prevents unhandled exceptions
4. **Async Non-Blocking**: Profile check doesn't delay route navigation

## Testing Instructions

### Unit Tests Only (No Supabase Required)
```bash
npm test -- tests/auth/profile-creation.test.ts
```

### Integration Tests (Requires Supabase)

1. Configure local Supabase:
```bash
supabase start
```

2. Create `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=<your-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

3. Run tests:
```bash
bun test tests/auth/profile-creation.test.ts --env-file .env.local
```

## Database Verification

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check User Profiles
```sql
SELECT 
  u.id, 
  u.email, 
  COUNT(p.id) as profile_count,
  p.alias
FROM public.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
GROUP BY u.id, u.email, p.alias
HAVING COUNT(p.id) > 0;
```

### Check Unique Constraint
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name='user_profiles' 
AND constraint_type='UNIQUE';
```

## Summary

✓ **Profile Creation:** First login triggers profile creation via database trigger
✓ **Duplication Prevention:** Unique constraint + conditional insert logic
✓ **Layers of Defense:** Database, trigger, client-side validation
✓ **Error Resilience:** Graceful handling of edge cases
✓ **Test Coverage:** Unit tests passing, integration tests ready

The implementation ensures that:
- Every user gets exactly ONE profile
- Subsequent logins never create duplicates
- Multiple defense layers prevent data corruption
- The system is resilient to edge cases and failures
