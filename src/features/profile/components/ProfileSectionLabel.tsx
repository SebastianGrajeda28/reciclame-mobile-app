import { ReactNode } from 'react';

import { AppText } from '@/src/ui';

type ProfileSectionLabelProps = {
  children: ReactNode;
};

export function ProfileSectionLabel({ children }: ProfileSectionLabelProps) {
  return (
    <AppText variant="overline" muted style={{ letterSpacing: 1 }}>
      {children}
    </AppText>
  );
}
