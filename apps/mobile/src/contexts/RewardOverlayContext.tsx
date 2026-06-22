import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type RewardItem =
  | {
      type: 'streak';
      streakDays: number;
      leveledUp: boolean;
      level: number;
      streakExtendedToday: boolean;
    }
  | {
      type: 'achievement';
      badgeId: string;
      badgeName?: string;
      badgeReward?: string;
      badgeDescription?: string;
    };

type RewardOverlayContextValue = {
  items: RewardItem[];
  visible: boolean;
  showReward: (items: RewardItem[]) => void;
  hideReward: () => void;
};

const RewardOverlayContext = createContext<RewardOverlayContextValue>({
  items: [],
  visible: false,
  showReward: () => {},
  hideReward: () => {},
});

export function RewardOverlayProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [visible, setVisible] = useState(false);

  const showReward = useCallback((newItems: RewardItem[]) => {
    if (newItems.length === 0) return;
    setItems(newItems);
    setVisible(true);
  }, []);

  const hideReward = useCallback(() => {
    setVisible(false);
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, visible, showReward, hideReward }),
    [items, visible, showReward, hideReward],
  );

  return (
    <RewardOverlayContext.Provider value={value}>
      {children}
    </RewardOverlayContext.Provider>
  );
}

export function useRewardOverlay() {
  return useContext(RewardOverlayContext);
}
