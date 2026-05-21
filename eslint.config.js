// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

const FEATURE_NAMES = ['auth', 'recycling', 'map', 'profile', 'friends'];
const FEATURE_EXTRA_ALLOWED_IMPORTS = {
  map: ['recycling'],
};

function buildFeatureRestriction(featureName) {
  const allowedFeatures = new Set([
    featureName,
    ...(FEATURE_EXTRA_ALLOWED_IMPORTS[featureName] ?? []),
  ]);
  const allowedFeaturePattern = Array.from(allowedFeatures).join('|');

  return [
    'error',
    {
      patterns: [
        {
          regex: `^@/src/features/(?!(${allowedFeaturePattern})(/|$)).+`,
          message:
            'Avoid direct cross-feature imports. Move shared logic to src/services, src/types, src/hooks, or src/ui.',
        },
      ],
    },
  ];
}

const featureBoundaryConfigs = FEATURE_NAMES.map((featureName) => ({
  files: [`src/features/${featureName}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': buildFeatureRestriction(featureName),
  },
}));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'web-build/*'],
  },
  {
    files: ['app/**/*.tsx'],
    ignores: ['app/_layout.tsx', 'app/(tabs)/_layout.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react-native', 'react-native/*'],
              message: 'Route files in app/ must stay thin wrappers without UI implementation.',
            },
            {
              group: ['@/src/services/**', '@/src/hooks/**', '@/src/utils/**', '@/src/types/**'],
              message: 'Route files should not contain business logic dependencies.',
            },
            {
              group: ['@/src/ui/**', '@/src/constants/**'],
              message: 'Route files should not render UI or depend on UI/theme constants.',
            },
            {
              regex: '^@/src/features/(?![^/]+/screens(/|$)).+',
              message:
                'Route wrappers should import only screen entrypoints from src/features/*/screens.',
            },
          ],
        },
      ],
    },
  },
  ...featureBoundaryConfigs,
  eslintConfigPrettier,
]);
