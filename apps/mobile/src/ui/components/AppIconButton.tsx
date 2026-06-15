import { ComponentProps } from 'react';

import { AppButton } from '@/src/ui/components/AppButton';

type AppIconButtonProps = Omit<
  ComponentProps<typeof AppButton>,
  'label' | 'size' | 'iconOnly' | 'leftIcon' | 'rightIcon'
> & {
  icon: React.ReactNode;
};

export function AppIconButton({ icon, ...props }: AppIconButtonProps) {
  return <AppButton size="icon" iconOnly leftIcon={icon} {...props} />;
}
