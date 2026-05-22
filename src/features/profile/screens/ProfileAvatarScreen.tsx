import { useState } from 'react';

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfileAvatarPreview } from '@/src/features/profile/components/ProfileAvatarPreview';
import { ProfileAvatarSwatchGrid } from '@/src/features/profile/components/ProfileAvatarSwatchGrid';
import { ProfileAvatarTabSelector } from '@/src/features/profile/components/ProfileAvatarTabSelector';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import {
  profileAvatarSwatches,
  profileCustomizationTabs,
  ProfileCustomizationTab,
} from '@/src/features/profile/data/profileAvatarOptions';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { AppButton, AppIcon, AppIconButton, theme } from '@/src/ui';

export function ProfileAvatarScreen() {
  const [selectedTab, setSelectedTab] = useState<ProfileCustomizationTab>(
    profileCustomizationTabs[0],
  );

  return (
    <ProfileScreenContainer>
      <ProfileSubpageHeader
        title="Personalizar avatar"
        leading={
          <AppIconButton
            accessibilityRole="button"
            accessibilityLabel="Guardar y volver"
            onPress={() => router.back()}
            variant="outline"
            icon={
              <AppIcon name="check" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
            }
          />
        }
      />

      <ProfileAvatarPreview />
      <ProfileAvatarTabSelector
        tabs={profileCustomizationTabs}
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
      />
      <ProfileAvatarSwatchGrid swatches={profileAvatarSwatches} />

      <View style={styles.footerActions}>
        <AppButton label="Cancelar" variant="outline" onPress={() => router.back()} />
        <AppButton
          label="Actualizar apariencia"
          onPress={() => router.back()}
          style={styles.primaryAction}
        />
      </View>
    </ProfileScreenContainer>
  );
}

export default ProfileAvatarScreen;

const styles = StyleSheet.create({
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
  },
  primaryAction: {
    flex: 1,
  },
});
