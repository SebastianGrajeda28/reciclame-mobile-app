import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/src/services/supabase/client';

const STORAGE_KEY = 'recycling_session_pending';

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

export async function loadPendingSession(): Promise<LocalRecyclingSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalRecyclingSession) : null;
  } catch {
    return null;
  }
}

export async function savePendingSession(session: LocalRecyclingSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // silent — metrics are best-effort
  }
}

export async function clearPendingSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}

function generateId(): string {
  // Supabase client already depends on crypto — reuse the same pattern
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

export async function flushSession(session: LocalRecyclingSession): Promise<boolean> {
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

export async function flushAndStartNewSession(userId: string | null): Promise<LocalRecyclingSession> {
  const pending = await loadPendingSession();
  if (pending && !pending.outcome) {
    pending.outcome = 'abandoned';
  }
  if (pending) {
    const flushed = await flushSession(pending);
    if (flushed) {
      await clearPendingSession();
    }
    // if flush failed (no network): leave in AsyncStorage, retry next time
  }
  const next = createNewSession(userId);
  await savePendingSession(next);
  return next;
}
