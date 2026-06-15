# Edge Functions Guide

This directory contains Supabase Edge Functions only.

## Current functions

- `admin-provision-user`: privileged admin workflow to create a user and assign an initial role

## Structure rule

Keep each function in its own folder because the folder name is the deployed function name.

That means structure may be organized with documentation, but deployed function folders themselves should not be renamed casually.

## When to add an Edge Function

Add one when:

- the client should not hold the logic
- service role access is required
- orchestration spans Auth plus database writes
- an admin-only workflow needs a hardened backend entrypoint

Do not add one when a straightforward RLS-protected table operation or RPC already solves the use case cleanly.
