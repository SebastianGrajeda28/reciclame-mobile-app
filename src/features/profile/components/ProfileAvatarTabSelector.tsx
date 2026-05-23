import { StyleSheet, View } from 'react-native';

import { ProfileCustomizationTab } from '@/src/features/profile/data/profileAvatarOptions';
import { AppChip, theme } from '@/src/ui';

type ProfileAvatarTabSelectorProps = {
  tabs: readonly ProfileCustomizationTab[];
  selectedTab: ProfileCustomizationTab;
  onSelect: (tab: ProfileCustomizationTab) => void;
};

export function ProfileAvatarTabSelector({
  tabs,
  selectedTab,
  onSelect,
}: ProfileAvatarTabSelectorProps) {
  return (
    <View style={styles.tabsRow}>
      {tabs.map((tab) => (
        <AppChip key={tab} label={tab} active={selectedTab === tab} onPress={() => onSelect(tab)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
  },
});
