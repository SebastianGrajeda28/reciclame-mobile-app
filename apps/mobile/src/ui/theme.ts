// Full brand scales from the design system.
// Use these when building primitives or when a specific step is explicitly required by design.
const palette = {
  green: {
    50: '#ECFDF3',
    100: '#D1FADF',
    200: '#A6F4C5',
    300: '#6CE9A6',
    400: '#43DF8B',
    500: '#12B76A',
    600: '#039855',
    700: '#027A48',
    800: '#05603A',
    900: '#054F31',
    DEFAULT: '#43DF8B',
  },
  navy: {
    50: '#F0F5F9',
    100: '#DCE6EE',
    200: '#B3C6D9',
    300: '#7E9AB5',
    400: '#4B6F9B',
    500: '#1B4970',
    600: '#0B2F4E',
    700: '#00253D',
    800: '#001A2D',
    900: '#0B1B1C',
    DEFAULT: '#0B2F4E',
  },
  cyan: {
    100: '#D7F1F7',
    300: '#7DD3E4',
    500: '#26B0CF',
    700: '#1A7A91',
    DEFAULT: '#26B0CF',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFB',
    100: '#EAEDEF',
    200: '#D9DEE2',
    300: '#BBC0C6',
    400: '#8B9590',
    500: '#6B757D',
    600: '#4F585F',
    700: '#353C42',
    800: '#1F2428',
    900: '#0E1114',
    DEFAULT: '#EAEDEF',
  },
} as const;

// Semantic aliases compose on top of the raw palette.
// Prefer these for feedback/status UI instead of picking palette steps ad hoc in screens.
const semantic = {
  success: {
    fg: palette.green[500],
    bg: palette.green[50],
  },
  warning: {
    fg: '#F59E0B',
    bg: '#FEF3C7',
  },
  error: {
    fg: '#DC2626',
    bg: '#FEE2E2',
  },
  info: {
    fg: palette.cyan[500],
    bg: palette.cyan[100],
    border: palette.cyan[300],
  },
} as const;

// Color con alpha, para evitar rgba ad-hoc en pantallas.
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const theme = {
  palette,
  semantic,
  withAlpha,
  // Product-facing aliases.
  // Default app code should use theme.colors.* first.
  // Reach for theme.palette.* only when creating DS primitives or implementing a design-specified tone.
  colors: {
    // Surfaces & backgrounds
    background: palette.neutral[50],
    surface: palette.neutral[0],
    surfaceMuted: palette.neutral[50],
    scrim: 'rgba(15, 23, 42, 0.55)', // velo oscuro detrás de overlays/modales

    // Text
    textPrimary: palette.neutral[900],
    textSecondary: palette.neutral[500],
    textInverse: palette.neutral[0],
    textInverseSubtle: 'rgba(255,255,255,0.6)', // white 60% — inactive text on dark surfaces

    // Borders
    border: palette.neutral[200],
    borderStrong: palette.neutral[300],

    // Brand — Green (Primary)
    primary: palette.green.DEFAULT,
    primaryPressed: palette.green[500],
    primaryLight: palette.green[50],
    primarySubtle: palette.green[200],

    // Brand — Navy (Secondary)
    secondary: palette.navy.DEFAULT,
    secondaryPressed: palette.navy[700],

    // Brand — Cyan (Accent)
    accent: palette.cyan.DEFAULT,
    accentPressed: palette.cyan[700],

    // Outline button stroke
    outline: palette.neutral[300],

    // Semantic
    success: semantic.success.fg,
    successBg: semantic.success.bg,
    warning: semantic.warning.fg,
    warningBg: semantic.warning.bg,
    danger: semantic.error.fg,
    dangerBg: semantic.error.bg,
    info: semantic.info.fg,
    infoBg: semantic.info.bg,
    infoBorder: semantic.info.border,

    // Inputs
    inputBackground: palette.neutral[0],
    inputPlaceholder: palette.neutral[300],

    // Disabled
    disabled: palette.neutral[200],
    disabledText: palette.neutral[300],

    // Legacy aliases kept for existing screens
    infoTintBackground: semantic.info.bg,
    infoTintBorder: semantic.info.border,
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
    h1: { fontSize: 28, lineHeight: 31, fontWeight: '800' as const },
    h2: { fontSize: 22, lineHeight: 26, fontWeight: '700' as const },
    h3: { fontSize: 18, lineHeight: 23, fontWeight: '700' as const },
    h4: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
    bodyL: { fontSize: 17, lineHeight: 27, fontWeight: '400' as const },
    body: { fontSize: 15, lineHeight: 24, fontWeight: '400' as const },
    bodyS: { fontSize: 13, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
    overline: { fontSize: 10, lineHeight: 13, fontWeight: '700' as const },
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
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
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
      shadowColor: palette.green.DEFAULT,
      shadowOpacity: 0.4,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    // Halo de color (el llamador fija shadowColor).
    glow: {
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 16,
      shadowOpacity: 0.45,
      elevation: 6,
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
    headerScore: palette.green[700],
    headerSubtitle: palette.cyan[500],
    iconNeutral: palette.neutral[600],
    iconButtonBg: palette.neutral[200],
    iconButtonSelectedBg: palette.green[50],
    iconButtonCameraBg: palette.navy[500],
    tabActive: palette.green.DEFAULT,
    tabInactive: palette.neutral[500],
  },
} as const;

export type AppTheme = typeof theme;
