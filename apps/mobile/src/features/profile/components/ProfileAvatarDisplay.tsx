import { Image, StyleSheet, View } from 'react-native';

import { AppText, theme } from '@/src/ui';

type ProfileAvatarDisplayProps = {
  avatarUrl?: string;
  displayName: string;
  size?: 'md' | 'lg';
};

function buildInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('');
}

export function ProfileAvatarDisplay({
  avatarUrl,
  displayName,
  size = 'lg',
}: ProfileAvatarDisplayProps) {
  const initials = buildInitials(displayName || 'Yo');
  const avatarSize = size === 'lg' ? 132 : 104;
  const ringWidth = size === 'lg' ? 8 : 6;

  return (
    <View
      style={[
        styles.avatarShell,
        {
          width: avatarSize,
          height: avatarSize,
          borderWidth: ringWidth,
        },
      ]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <AppText variant={size === 'lg' ? 'h1' : 'h2'} style={styles.avatarInitials}>
            {initials}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarShell: {
    borderRadius: theme.radius.full,
    borderColor: theme.colors.primaryLight,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.disabled,
  },
  avatarInitials: {
    color: theme.colors.textPrimary,
  },
});
