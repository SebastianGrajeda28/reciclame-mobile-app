import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, AppText, theme } from '@/src/ui';
import { HISTORY_CATEGORIES } from '@/src/features/recycling/services/historyCategories';

type Props = {
  visible: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

const OPTIONS: { id: string | null; label: string }[] = [
  { id: null, label: 'Todas' },
  ...HISTORY_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

export function HistoryCategorySheet({ visible, selectedId, onSelect, onClose }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: bottom + theme.spacing.md }]}>
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Filtrar por categoría
          </AppText>
          <ScrollView>
            {OPTIONS.map((opt) => {
              const active = selectedId === opt.id;
              return (
                <Pressable
                  key={opt.id ?? 'all'}
                  style={styles.row}
                  onPress={() => {
                    onSelect(opt.id);
                    onClose();
                  }}
                >
                  <AppText style={[styles.label, active && styles.labelActive]}>
                    {opt.label}
                  </AppText>
                  {active ? (
                    <AppIcon
                      name="checkCircle"
                      size={theme.iconSizes.md}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
});
