import {
  BATTERIES_BIN_TYPE_ID,
  GLASS_BIN_TYPE_ID,
  NON_RECOVERABLE_BIN_TYPE_ID,
  PAPER_CARDBOARD_BIN_TYPE_ID,
  PLASTICS_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '@/src/features/recycling/services/bin-types.mock';
import type { AppIconName } from '@/src/ui/components/AppIcon';

type BinTypeConfig = {
  color: string;
  iconColor: string;
  icon: AppIconName;
};

export const binTypeConfig: Record<string, BinTypeConfig> = {
  [PLASTICS_BIN_TYPE_ID]: { color: '#26B0CF', iconColor: '#FFFFFF', icon: 'bottle' },
  [NON_RECOVERABLE_BIN_TYPE_ID]: { color: '#353C42', iconColor: '#FFFFFF', icon: 'delete' },
  [GLASS_BIN_TYPE_ID]: { color: '#12B76A', iconColor: '#FFFFFF', icon: 'flask' },
  [PAPER_CARDBOARD_BIN_TYPE_ID]: { color: '#4B6F9B', iconColor: '#FFFFFF', icon: 'briefcase' },
  [BATTERIES_BIN_TYPE_ID]: { color: '#F59E0B', iconColor: '#FFFFFF', icon: 'battery' },
  [RAEE_BIN_TYPE_ID]: { color: '#0B2F4E', iconColor: '#FFFFFF', icon: 'laptop' },
};
