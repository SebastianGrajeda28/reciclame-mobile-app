import { confirmSegregation } from '@/src/features/recycling/api/recyclingLogs';
import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import { useAuth } from '@/src/hooks/useAuth';
import { checkUnlockedAchievements } from '@/src/services/achievements';
import { supabase } from '@/src/services/supabase/client';
import { useStreakInvalidation } from '@/src/contexts/StreakInvalidationContext';
import { AppText } from '@/src/ui';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

const BIN_TYPE_ID = '33333333-3333-3333-3333-000000000001';
const FAB_SIZE = 44;
const HEADER_H = 36;
const TAB_H = 34;

type Tab = 'recycle' | 'achievements' | 'streak' | 'log';
type RecyclingPoint = { id: string; name: string };
type OwnedAchievement = { slug: string; name: string };
type LogLine = { id: number; text: string; ok: boolean };
let lid = 0;

// ── Small reusable primitives ────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <View style={p.row}>{children}</View>;
}

function Label({ children }: { children: string }) {
  return <AppText style={p.label}>{children}</AppText>;
}

function Btn({ label, onPress, green, disabled }: { label: string; onPress: () => void; green?: boolean; disabled?: boolean }) {
  return (
    <Pressable style={[p.btn, green && p.btnGreen, disabled && p.btnOff]} onPress={onPress} disabled={disabled}>
      <AppText style={[p.btnTxt, green && p.btnTxtGreen]}>{label}</AppText>
    </Pressable>
  );
}

function Select({ items, selected, onSelect }: { items: { id: string; label: string }[]; selected: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const sel = items.find((i) => i.id === selected);
  return (
    <View>
      <Pressable style={p.select} onPress={() => setOpen((v) => !v)}>
        <AppText style={p.selectTxt} numberOfLines={1}>{sel?.label ?? '— seleccionar —'}</AppText>
        <AppText style={p.selectArrow}>{open ? '▲' : '▼'}</AppText>
      </Pressable>
      {open && (
        <View style={p.dropdown}>
          {items.map((item) => (
            <Pressable key={item.id} style={[p.dropItem, item.id === selected && p.dropItemOn]} onPress={() => { onSelect(item.id); setOpen(false); }}>
              <AppText style={[p.dropTxt, item.id === selected && p.dropTxtOn]} numberOfLines={1}>{item.label}</AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function DevPanel() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { invalidateStreak } = useStreakInvalidation();

  const { width, height } = Dimensions.get('window');
  const PANEL_W = Math.round(width * 0.88);
  const PANEL_H = Math.round(height * 0.58);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('recycle');
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);

  // Recycle tab
  const [points, setPoints] = useState<RecyclingPoint[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState(wasteTypes[0].id);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Achievements tab
  const [ownedAchs, setOwnedAchs] = useState<OwnedAchievement[]>([]);
  const [achsLoaded, setAchsLoaded] = useState(false);

  // Streak tab
  const [streakInput, setStreakInput] = useState('');
  const [heatInput, setHeatInput] = useState('');
  const [currentStreak, setCurrentStreak] = useState<{ streak: number; heat: number } | null>(null);

  const pan = useRef(new Animated.ValueXY({
    x: Math.round((width - PANEL_W) / 2),
    y: Math.round(height * 0.18),
  })).current;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,
    onPanResponderGrant: () => {
      pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => pan.flattenOffset(),
  })).current;

  const addLog = (text: string, ok = true) =>
    setLogs((prev) => [...prev.slice(-49), { id: lid++, text, ok }]);

  // ── Recycle ────────────────────────────────────────────────────────────────

  const loadPoints = async () => {
    const { data, error } = await supabase.from('recycling_points').select('id, name').eq('is_active', true).limit(30);
    if (error) { addLog(`✗ ${error.message}`, false); return; }
    const pts = (data ?? []) as RecyclingPoint[];
    setPoints(pts);
    if (pts.length > 0 && !selectedPointId) setSelectedPointId(pts[0].id);
    addLog(`${pts.length} puntos cargados`);
  };

  const handleRecycle = async () => {
    const waste = wasteTypes.find((w) => w.id === selectedWasteId);
    if (!userId || !selectedPointId || !waste) { addLog('Sin sesión/punto/residuo', false); return; }
    setBusy(true);
    try {
      const r = await confirmSegregation({ userId, wasteTypeId: waste.id, binTypeId: BIN_TYPE_ID, recyclingPointId: selectedPointId, detectionType: 'manual' });
      addLog(`✓ racha:${r.streakDays}d heat:${r.heat} lv:${r.level}${r.leveledUp ? ' ⬆NIVEL' : ''}${r.alreadyRecycledToday ? ' (ya hoy)' : ''}`);
      const unlocked = await checkUnlockedAchievements(userId);
      if (unlocked.length > 0) {
        addLog(`🏆 ${unlocked.length} logro(s): ${unlocked.map((a) => a.name).join(', ')}`);
        const [first, ...rest] = unlocked;
        setOpen(false);
        router.push({
          pathname: '/recycle/reward',
          params: {
            badgeId: first.slug,
            badgeName: first.name,
            badgeReward: first.rewardName ?? '',
            badgeDescription: first.unlockDescription ?? '',
            queue: rest.length > 0 ? JSON.stringify(rest.map((a) => ({
              badgeId: a.slug,
              badgeName: a.name,
              badgeReward: a.rewardName ?? undefined,
              badgeDescription: a.unlockDescription ?? undefined,
            }))) : undefined,
          },
        });
      }
    } catch (e) { addLog(`✗ ${e instanceof Error ? e.message : String(e)}`, false); }
    finally { setBusy(false); }
  };

  const handleRollback = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_rollback_last_record');
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog('Sin registros', false); return; }
      addLog(`↩ ${String(data.old_date).slice(0, 10)} → ${String(data.new_date).slice(0, 10)}`);
    } finally { setBusy(false); }
  };

  const handleDeleteLast = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_delete_last_record');
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog('Sin registros', false); return; }
      addLog(`🗑 eliminado ${String(data.id).slice(0, 8)}… (${String(data.created_at).slice(0, 10)})`);
    } finally { setBusy(false); }
  };

  // ── Achievements ───────────────────────────────────────────────────────────

  const loadAchievements = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('user_achievements').select('achievements(slug, name)').eq('user_id', userId);
    if (error) { addLog(`✗ ${error.message}`, false); return; }
    const list = (data ?? []).map((r: any) => ({ slug: r.achievements.slug as string, name: r.achievements.name as string }));
    setOwnedAchs(list);
    setAchsLoaded(true);
    addLog(`${list.length} logros cargados`);
  };

  const handleRevoke = async (slug: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_revoke_achievement', { p_slug: slug });
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog(`✗ ${data?.error}`, false); return; }
      addLog(`🗑 revocado: ${slug}`);
      setOwnedAchs((prev) => prev.filter((a) => a.slug !== slug));
    } finally { setBusy(false); }
  };

  // ── Streak ─────────────────────────────────────────────────────────────────

  const loadStreak = async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc('get_progress_with_decay', { p_user_id: userId });
    if (error) { addLog(`✗ ${error.message}`, false); return; }
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      setCurrentStreak({ streak: row.streak_days, heat: row.heat });
      setStreakInput(String(row.streak_days));
      setHeatInput(String(row.heat));
      addLog(`Racha actual: ${row.streak_days}d heat:${row.heat}`);
    }
  };

  const handleSetStreak = async () => {
    setBusy(true);
    try {
      const s = parseInt(streakInput, 10);
      const h = parseInt(heatInput, 10);
      if (isNaN(s) || isNaN(h)) { addLog('Valores inválidos', false); return; }
      const { data, error } = await supabase.rpc('dev_set_streak', { p_streak_days: s, p_heat: h });
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog(`✗ ${data?.error}`, false); return; }
      setCurrentStreak({ streak: s, heat: h });
      invalidateStreak();
      addLog(`✓ racha: ${s}d heat: ${h} lv: ${data.level}`);
    } finally { setBusy(false); }
  };

  const handleResetProgress = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_reset_progress');
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog(`✗ ${data?.error}`, false); return; }
      setCurrentStreak({ streak: 0, heat: 0 });
      setStreakInput('0');
      setHeatInput('0');
      setOwnedAchs([]);
      invalidateStreak();
      addLog('🗑 progreso y logros reseteados completamente');
    } finally { setBusy(false); }
  };

  const handleStreakAdvance = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_streak_advance');
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog(`✗ ${data?.error}`, false); return; }
      setCurrentStreak({ streak: data.streak_days, heat: data.heat });
      setStreakInput(String(data.streak_days));
      setHeatInput(String(data.heat));
      invalidateStreak();
      addLog(`+1 día ✓ racha:${data.streak_days}d heat:${data.heat} lv:${data.level} (${String(data.record_date)})`);
    } finally { setBusy(false); }
  };

  const handleStreakMiss = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('dev_streak_miss');
      if (error) { addLog(`✗ ${error.message}`, false); return; }
      if (!data?.ok) { addLog(`✗ ${data?.error}`, false); return; }
      setCurrentStreak({ streak: data.streak_days, heat: data.heat });
      setStreakInput(String(data.streak_days));
      setHeatInput(String(data.heat));
      invalidateStreak();
      if (data.streak_died) {
        addLog(`💀 racha muerta · heat:${data.heat} streak:0`);
      } else {
        addLog(`+1 falla · racha:${data.streak_days}d heat:${data.heat}`);
      }
    } finally { setBusy(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string }[] = [
    { id: 'recycle', label: '♻ Reciclar' },
    { id: 'achievements', label: '🏆 Logros' },
    { id: 'streak', label: '🔥 Racha' },
    { id: 'log', label: '📋 Log' },
  ];

  return (
    <Animated.View style={[s.fab, { transform: pan.getTranslateTransform() }]} {...panResponder.panHandlers}>
      {open ? (
        <View style={[s.panel, { width: PANEL_W, height: PANEL_H }]}>

          {/* Header */}
          <View style={s.header}>
            <AppText style={s.headerTxt}>🛠 Dev Panel</AppText>
            <Pressable onPress={() => setOpen(false)} hitSlop={10} style={s.closeBtn}>
              <AppText style={s.closeTxt}>✕</AppText>
            </Pressable>
          </View>

          {/* Tab bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabBarContent}>
            {TABS.map((t) => (
              <Pressable key={t.id} style={[s.tab, tab === t.id && s.tabOn]} onPress={() => {
                setTab(t.id);
                if (t.id === 'achievements' && !achsLoaded) loadAchievements();
                if (t.id === 'streak' && !currentStreak) loadStreak();
              }}>
                <AppText style={[s.tabTxt, tab === t.id && s.tabTxtOn]}>{t.label}</AppText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Body */}
          <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>

            {/* ── Recycle ── */}
            {tab === 'recycle' && <>
              <Label>Tipo de residuo</Label>
              <Select
                items={wasteTypes.map((w) => ({ id: w.id, label: w.label }))}
                selected={selectedWasteId}
                onSelect={setSelectedWasteId}
              />
              <Label>Punto de reciclaje</Label>
              {points.length === 0
                ? <Btn label="Cargar puntos" onPress={loadPoints} />
                : <Select items={points.map((p) => ({ id: p.id, label: p.name }))} selected={selectedPointId} onSelect={setSelectedPointId} />
              }
              <Btn label="♻ Registrar reciclaje" onPress={handleRecycle} green disabled={busy || !selectedPointId} />
              <View style={s.divider} />
              <Label>Registros</Label>
              <Btn label="↩ Mover último registro −1 día" onPress={handleRollback} disabled={busy} />
              <Btn label="🗑 Eliminar último registro" onPress={handleDeleteLast} disabled={busy} />
            </>}

            {/* ── Achievements ── */}
            {tab === 'achievements' && <>
              <Row>
                <Label>Logros desbloqueados</Label>
                <Pressable onPress={loadAchievements} hitSlop={8} style={s.refreshBtn}>
                  <AppText style={s.refreshTxt}>↺</AppText>
                </Pressable>
              </Row>
              {!achsLoaded
                ? <Btn label="Cargar logros" onPress={loadAchievements} />
                : ownedAchs.length === 0
                  ? <AppText style={s.empty}>Sin logros desbloqueados</AppText>
                  : ownedAchs.map((a) => (
                      <View key={a.slug} style={s.achRow}>
                        <AppText style={s.achName} numberOfLines={1}>{a.name}</AppText>
                        <Pressable style={[s.revokeBtn, busy && s.off]} onPress={() => handleRevoke(a.slug)} disabled={busy}>
                          <AppText style={s.revokeTxt}>✕</AppText>
                        </Pressable>
                      </View>
                    ))
              }
            </>}

            {/* ── Streak ── */}
            {tab === 'streak' && <>
              <Row>
                <Label>Estado actual</Label>
                <Pressable onPress={loadStreak} hitSlop={8} style={s.refreshBtn}>
                  <AppText style={s.refreshTxt}>↺</AppText>
                </Pressable>
              </Row>
              {currentStreak && (
                <View style={s.streakInfo}>
                  <AppText style={s.streakInfoTxt}>Racha: {currentStreak.streak} días · Heat: {currentStreak.heat}</AppText>
                </View>
              )}
              <Label>Días de racha</Label>
              <TextInput
                style={s.input}
                value={streakInput}
                onChangeText={setStreakInput}
                keyboardType="number-pad"
                placeholder="ej: 7"
                placeholderTextColor="#555"
              />
              <Label>Heat (0–100)</Label>
              <TextInput
                style={s.input}
                value={heatInput}
                onChangeText={setHeatInput}
                keyboardType="number-pad"
                placeholder="ej: 50"
                placeholderTextColor="#555"
              />
              <Btn label="✓ Aplicar" onPress={handleSetStreak} green disabled={busy} />
              <View style={s.divider} />
              <Label>Simular paso a paso</Label>
              <Row>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <Btn label="➕ Día reciclado" onPress={handleStreakAdvance} green disabled={busy} />
                </View>
                <View style={{ flex: 1, marginLeft: 4 }}>
                  <Btn label="💀 Día fallado" onPress={handleStreakMiss} disabled={busy} />
                </View>
              </Row>
              <View style={s.divider} />
              <Btn label="🗑 Reset total (progreso + logros + registros)" onPress={handleResetProgress} disabled={busy} />
              <View style={s.divider} />
              <Label>Presets rápidos</Label>
              {[
                { label: 'Racha en peligro (5d / heat:10)', streak: 5, heat: 10 },
                { label: 'Nivel 2 (3d / heat:50)', streak: 3, heat: 50 },
                { label: 'Nivel 3 (9d / heat:60)', streak: 9, heat: 60 },
                { label: 'Nivel 4 (21d / heat:75)', streak: 21, heat: 75 },
                { label: 'Nivel 5 (45d / heat:90)', streak: 45, heat: 90 },
              ].map((preset) => (
                <Btn key={preset.label} label={preset.label} disabled={busy} onPress={() => {
                  setStreakInput(String(preset.streak));
                  setHeatInput(String(preset.heat));
                }} />
              ))}
            </>}

            {/* ── Log ── */}
            {tab === 'log' && <>
              <Row>
                <Label>Actividad reciente</Label>
                <Pressable onPress={() => setLogs([])} hitSlop={8} style={s.refreshBtn}>
                  <AppText style={s.refreshTxt}>🗑</AppText>
                </Pressable>
              </Row>
              {logs.length === 0
                ? <AppText style={s.empty}>Sin entradas aún</AppText>
                : [...logs].reverse().map((l) => (
                    <AppText key={l.id} style={[s.logLine, !l.ok && s.logErr]}>{l.text}</AppText>
                  ))
              }
            </>}

          </ScrollView>
        </View>
      ) : (
        <Pressable style={s.bubble} onPress={() => setOpen(true)}>
          <AppText style={s.bubbleTxt}>🛠</AppText>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const C = { bg: '#1a1a1a', bg2: '#111', bg3: '#2a2a2a', border: '#333', border2: '#444', txt: '#ccc', muted: '#666', green: '#00c853', red: '#c0392b' };

const p = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: C.muted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 10, marginBottom: 4 },
  btn: { backgroundColor: C.bg3, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border2, marginBottom: 4 },
  btnGreen: { backgroundColor: C.green, borderColor: C.green },
  btnOff: { opacity: 0.4 },
  btnTxt: { color: C.txt, fontSize: 12 },
  btnTxtGreen: { color: '#fff', fontWeight: '600' },
  select: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg3, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border2, marginBottom: 4 },
  selectTxt: { flex: 1, color: C.txt, fontSize: 12 },
  selectArrow: { color: C.muted, fontSize: 10, marginLeft: 6 },
  dropdown: { backgroundColor: '#222', borderRadius: 8, borderWidth: 1, borderColor: C.border2, marginBottom: 4, maxHeight: 160, overflow: 'hidden' },
  dropItem: { paddingVertical: 8, paddingHorizontal: 12 },
  dropItemOn: { backgroundColor: C.green },
  dropTxt: { color: C.txt, fontSize: 12 },
  dropTxtOn: { color: '#fff', fontWeight: '600' },
});

const s = StyleSheet.create({
  fab: { position: 'absolute', zIndex: 9999 },
  bubble: { width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center' },
  bubbleTxt: { fontSize: 20 },
  panel: { backgroundColor: C.bg, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  header: { height: HEADER_H, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, backgroundColor: C.bg2, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  closeBtn: { padding: 4 },
  closeTxt: { color: '#888', fontSize: 15 },
  tabBar: { flexGrow: 0, height: TAB_H, backgroundColor: C.bg2, borderBottomWidth: 1, borderBottomColor: C.border },
  tabBarContent: { flexDirection: 'row' },
  tab: { paddingHorizontal: 14, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: C.green },
  tabTxt: { color: C.muted, fontSize: 11, fontWeight: '600' },
  tabTxtOn: { color: C.green },
  body: { flex: 1 },
  bodyContent: { padding: 12, paddingBottom: 20 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  refreshBtn: { padding: 4 },
  refreshTxt: { color: C.muted, fontSize: 16 },
  achRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 4 },
  achName: { flex: 1, color: C.txt, fontSize: 12 },
  revokeBtn: { backgroundColor: C.red, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  off: { opacity: 0.4 },
  revokeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  streakInfo: { backgroundColor: '#0d2b1a', borderRadius: 8, padding: 10, marginBottom: 4 },
  streakInfoTxt: { color: C.green, fontSize: 12, fontWeight: '600' },
  input: { backgroundColor: C.bg3, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border2, color: '#fff', fontSize: 14, marginBottom: 4 },
  empty: { color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 24 },
  logLine: { color: '#00ff88', fontSize: 10, fontFamily: 'monospace', marginBottom: 2 },
  logErr: { color: '#ff4444' },
});
