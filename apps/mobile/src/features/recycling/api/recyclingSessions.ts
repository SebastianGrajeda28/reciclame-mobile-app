import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/src/services/supabase/client';

const ACTIVE_KEY = 'recycling_session_active';
const QUEUE_KEY = 'recycling_session_queue';

export type FlowStep = 'camera' | 'processing' | 'manual' | 'map' | 'instructions' | 'success';
export type SessionOutcome = 'confirmed' | 'abandoned' | 'failed';

export type LocalRecyclingSession = {
  sessionId: string;
  userId: string | null;
  startedAt: string;
  furthestStep: FlowStep;
  detectionType?: 'auto' | 'manual';
  predictedWasteTypeId?: string;
  finalWasteTypeId?: string;
  confidenceScore?: number;
  wasteTypeOverridden?: boolean;
  recyclingPointId?: string;
  recyclingRecordId?: string;
  outcome?: SessionOutcome;
};

const STEP_ORDER: FlowStep[] = ['camera', 'processing', 'manual', 'map', 'instructions', 'success'];

export function advanceStep(current: FlowStep, next: FlowStep): FlowStep {
  return STEP_ORDER.indexOf(next) > STEP_ORDER.indexOf(current) ? next : current;
}

// ─── active session ───────────────────────────────────────────────────────────

export async function loadActiveSession(): Promise<LocalRecyclingSession | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as LocalRecyclingSession) : null;
  } catch {
    return null;
  }
}

export async function saveActiveSession(session: LocalRecyclingSession): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
  } catch {
    // silent — metrics are best-effort
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_KEY);
  } catch {
    // silent
  }
}

// ─── offline queue ────────────────────────────────────────────────────────────

async function loadQueue(): Promise<LocalRecyclingSession[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as LocalRecyclingSession[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: LocalRecyclingSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // silent
  }
}

async function enqueue(session: LocalRecyclingSession): Promise<void> {
  const queue = await loadQueue();
  queue.push(session);
  await saveQueue(queue);
}

// ─── supabase insert ──────────────────────────────────────────────────────────

async function insertSession(session: LocalRecyclingSession): Promise<boolean> {
  if (!session.outcome) return false;
  try {
    const { error } = await supabase.from('recycling_sessions').insert({
      id: session.sessionId,
      user_id: session.userId,
      outcome: session.outcome,
      furthest_step: session.furthestStep,
      detection_type: session.detectionType ?? null,
      predicted_waste_type_id: session.predictedWasteTypeId ?? null,
      final_waste_type_id: session.finalWasteTypeId ?? null,
      confidence_score: session.confidenceScore ?? null,
      waste_type_overridden: session.wasteTypeOverridden ?? null,
      recycling_point_id: session.recyclingPointId ?? null,
      recycling_record_id: session.recyclingRecordId ?? null,
      started_at: session.startedAt,
      ended_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── public API ───────────────────────────────────────────────────────────────

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [...bytes]
    .map((b, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0'))
    .join('');
}

export function createNewSession(userId: string | null): LocalRecyclingSession {
  return {
    sessionId: generateId(),
    userId,
    startedAt: new Date().toISOString(),
    furthestStep: 'camera',
  };
}

// Keep savePendingSession / clearPendingSession as aliases so useRecycleFlow.tsx compiles unchanged.
export const savePendingSession = saveActiveSession;
export const clearPendingSession = clearActiveSession;
// loadPendingSession kept for backwards compat
export const loadPendingSession = loadActiveSession;

export async function flushSession(session: LocalRecyclingSession): Promise<boolean> {
  return insertSession(session);
}

/**
 * Drains the offline queue, inserting each session.
 * Stops at the first failure (network still down) — leaves remaining items.
 */
export async function drainQueue(): Promise<void> {
  const queue = await loadQueue();
  if (!queue.length) return;
  const remaining: LocalRecyclingSession[] = [];
  for (const session of queue) {
    const ok = await insertSession(session);
    if (!ok) {
      remaining.push(session, ...queue.slice(queue.indexOf(session) + 1));
      break;
    }
  }
  await saveQueue(remaining);
}

export async function flushAndStartNewSession(userId: string | null): Promise<LocalRecyclingSession> {
  // drain any previously queued sessions first
  await drainQueue();

  const active = await loadActiveSession();
  if (active) {
    if (!active.outcome) {
      active.outcome = 'abandoned';
    }
    const ok = await insertSession(active);
    if (ok) {
      await clearActiveSession();
    } else {
      // no network — move to queue so it isn't overwritten by the new session
      await enqueue(active);
      await clearActiveSession();
    }
  }

  const next = createNewSession(userId);
  await saveActiveSession(next);
  return next;
}
