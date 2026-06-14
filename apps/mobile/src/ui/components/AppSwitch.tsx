import { Switch, SwitchProps } from 'react-native';

import { theme } from '@/src/ui/theme';

type AppSwitchProps = Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'>;

export function AppSwitch({ value, ...props }: AppSwitchProps) {
  return (
    <Switch
      value={value}
      trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primarySubtle }}
      thumbColor={value ? theme.colors.accent : theme.colors.surface}
      ios_backgroundColor={theme.colors.borderStrong}
      {...props}
    />
  );
}
