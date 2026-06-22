import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/src/services/supabase/client';

const CACHE_KEY = 'instructions_cache_v1';

export type CachedInstructionStep = {
  id: string;
  text: string;
  imageUrl: string | null;
};

type InstructionsCache = {
  remoteUpdatedAt: string;
  fetchedAt: string;
  byWasteTypeId: Record<string, CachedInstructionStep[]>;
};

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

async function loadCache(): Promise<InstructionsCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as InstructionsCache) : null;
  } catch {
    return null;
  }
}

async function saveCache(cache: InstructionsCache): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // silent — cache is best-effort
  }
}

// ─── Supabase fetch ───────────────────────────────────────────────────────────

async function fetchRemoteUpdatedAt(): Promise<string | null> {
  const { data, error } = await supabase
    .from('instructions')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.updated_at as string;
}

async function fetchAllInstructions(): Promise<InstructionsCache['byWasteTypeId']> {
  const { data, error } = await supabase
    .from('instructions')
    .select('waste_type_id, updated_at, body');

  if (error || !data) return {};

  const result: InstructionsCache['byWasteTypeId'] = {};

  for (const row of data) {
    if (!row.waste_type_id || !row.body) continue;
    try {
      const parsed = JSON.parse(row.body as string) as { steps?: CachedInstructionStep[] };
      if (Array.isArray(parsed.steps)) {
        result[row.waste_type_id] = parsed.steps.map((s) => ({
          id: s.id,
          text: s.text,
          imageUrl: s.imageUrl ?? null,
        }));
      }
    } catch {
      // malformed body — skip
    }
  }

  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Syncs the local instructions cache with Supabase.
 * Only downloads data if the remote `updated_at` is newer than what we have cached.
 * Returns the up-to-date cache (from storage or freshly fetched).
 */
export async function syncInstructionsCache(): Promise<InstructionsCache['byWasteTypeId']> {
  const cached = await loadCache();
  const remoteUpdatedAt = await fetchRemoteUpdatedAt();

  // If remote check failed (offline), return whatever we have cached
  if (!remoteUpdatedAt) {
    return cached?.byWasteTypeId ?? {};
  }

  // Cache is still fresh — no download needed
  if (cached && cached.remoteUpdatedAt >= remoteUpdatedAt) {
    return cached.byWasteTypeId;
  }

  // Cache is stale or missing — fetch full data
  const byWasteTypeId = await fetchAllInstructions();
  await saveCache({
    remoteUpdatedAt,
    fetchedAt: new Date().toISOString(),
    byWasteTypeId,
  });

  return byWasteTypeId;
}

/**
 * Returns cached steps for a given wasteTypeId without hitting the network.
 * Returns null if nothing is cached yet.
 */
export async function getCachedSteps(wasteTypeId: string): Promise<CachedInstructionStep[] | null> {
  const cached = await loadCache();
  return cached?.byWasteTypeId[wasteTypeId] ?? null;
}
