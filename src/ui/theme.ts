export const theme = {
  colors: {
    // Surfaces & backgrounds
    background: '#F8FAFB',     // Neutral 50
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFB',

    // Text
    textPrimary: '#0E1114',    // Neutral 900
    textSecondary: '#6B757D',  // Neutral 500
    textInverse: '#FFFFFF',

    // Borders
    border: '#D9DEE2',         // Neutral 200
    borderStrong: '#BBC0C6',   // Neutral 300

    // Brand — Green (Primary)
    primary: '#12B76A',        // Green 500 ●
    primaryPressed: '#039855', // Green 600
    primaryLight: '#ECFDF3',   // Green 50
    primarySubtle: '#A6F4C5',  // Green 200

    // Brand — Navy (Secondary)
    secondary: '#1B4970',      // Navy 500 ●
    secondaryPressed: '#002F4E', // Navy 600

    // Brand — Cyan (Accent)
    accent: '#268BCF',         // Cyan 500 ●
    accentPressed: '#1A7A91',  // Cyan 700

    // Outline button stroke
    outline: '#BBC0C6',        // Neutral 300

    // Semantic
    success: '#12B76A',        // Green 500
    successBg: '#ECFDF3',      // Green 50
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    info: '#268BCF',           // Cyan 500
    infoBg: '#D7F1F7',         // Cyan 100
    infoBorder: '#7DD3E4',     // Cyan 300

    // Inputs
    inputBackground: '#FFFFFF',
    inputPlaceholder: '#BBC0C6', // Neutral 300

    // Disabled
    disabled: '#D9DEE2',       // Neutral 200
    disabledText: '#BBC0C6',   // Neutral 300

    // Legacy aliases kept for existing screens
    infoTintBackground: '#D7F1F7',
    infoTintBorder: '#7DD3E4',
  },

  // Base 4 px grid — s1…s16
  spacing: {
    s1: 4,
    s2: 8,
    s3: 12,
    s4: 16,
    s5: 20,
    s6: 24,
    s8: 32,
    s10: 40,
    s12: 48,
    s16: 64,

    // Legacy aliases kept for existing screens
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,

    // Legacy alias
    pill: 999,
  },

  // DS typography scale — Manrope
  typography: {
    display: { fontSize: 34, lineHeight: 36, fontWeight: '800' as const },
    h1:      { fontSize: 28, lineHeight: 31, fontWeight: '800' as const },
    h2:      { fontSize: 22, lineHeight: 26, fontWeight: '700' as const },
    h3:      { fontSize: 18, lineHeight: 23, fontWeight: '700' as const },
    h4:      { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
    bodyL:   { fontSize: 17, lineHeight: 27, fontWeight: '400' as const },
    body:    { fontSize: 15, lineHeight: 24, fontWeight: '400' as const },
    bodyS:   { fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
    overline:{ fontSize: 10, lineHeight: 13, fontWeight: '700' as const },
  },

  // Legacy fontSizes kept for existing screens
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },

  fontWeights: {
    regular: '400' as const,
    medium:  '500' as const,
    semibold:'600' as const,
    bold:    '700' as const,
    extrabold:'800' as const,
  },

  // Elevation levels
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    xs: {
      shadowColor: '#0E1114',
      shadowOpacity: 0.04,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sm: {
      shadowColor: '#0E1114',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: '#0E1114',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    lg: {
      shadowColor: '#0E1114',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    focus: {
      shadowColor: '#12B76A',
      shadowOpacity: 0.4,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    // Legacy alias
    card: {
      shadowColor: '#0E1114',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  },

  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  components: {
    screenPaddingHorizontal: 16,
    buttonHeights: {
      sm: 36,
      md: 44,
      lg: 50,
      icon: 38,
    },
    inputHeight: 48,
    cardPadding: 16,
    maxContentWidth: 420,
    navbarHeight: 64,
    chipHeight: 36,
    segmentedHeight: 40,
  },

  // Feature-specific tokens
  recycle: {
    headerScore: '#027A48',        // Green 700
    headerSubtitle: '#268BCF',     // Cyan 500
    iconNeutral: '#4F585F',        // Neutral 600
    iconButtonBg: '#D9DEE2',       // Neutral 200
    iconButtonSelectedBg: '#ECFDF3', // Green 50
    iconButtonCameraBg: '#1B4970', // Navy 500
    tabActive: '#12B76A',          // Green 500
    tabInactive: '#6B757D',        // Neutral 500
  },
} as const;

export type AppTheme = typeof theme;
