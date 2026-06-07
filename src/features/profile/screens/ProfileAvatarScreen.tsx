import { useState } from 'react';
import { useItemColorMap } from '@/src/features/profile/hooks/useItemColorMap';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

import { AvatarComposer } from '@/src/features/profile/components/AvatarComposer';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { useAvatarConfig } from '@/src/features/profile/hooks/useAvatarConfig';
import {
  AvatarConfig,
  AvatarRace,
  RACES,
  RACE_LABELS,
  RACE_SKINS,
  EYE_COLORS,
  EYE_STYLES,
  EAR_STYLES,
  NOSE_STYLES,
  MOUTH_STYLES,
  HAIR_COLORS,
  HAIR_STYLES,
  HAT_COLORS,
  HAT_STYLES,
  CLOTHES_COLORS,
  CLOTHES_STYLES,
  BROW_COLORS,
  BROW_STYLES,
  BEARD_COLORS,
  BEARD_STYLES,
  MOUSTACHE_COLORS,
  MOUSTACHE_STYLES,
  BG_COLORS,
  BG_STYLES,
  bgAssetName,
  getAsset,
  bgKey,
  baseKey,
  earsKey,
  noseKey,
  mouthKey,
  eyeKey,
  browsKey,
  hairKey,
  hatKey,
  clothesKey,
  beardKey,
  moustacheKey,
} from '@/src/features/profile/data/avatarCatalog';
import { COSMETIC_COLOR_HEX } from '@/src/features/profile/data/avatarCatalog';
import { AppButton, AppChip, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type Tab = 'Raza' | 'Piel' | 'Ojos' | 'Orejas' | 'Nariz' | 'Boca' | 'Cejas' | 'Pelo' | 'Barba' | 'Bigote' | 'Ropa' | 'Gorro' | 'Fondo';
const TABS: Tab[] = ['Raza', 'Piel', 'Ojos', 'Orejas', 'Nariz', 'Boca', 'Cejas', 'Pelo', 'Barba', 'Bigote', 'Ropa', 'Gorro', 'Fondo'];

const AVATAR_SIZE = 192;
const SWATCH_SIZE = 56;

type SwatchItem = {
  id: string;
  label?: string;
  source?: number | null;
  selected: boolean;
  onPress: () => void;
};

function Swatch({ item }: { item: SwatchItem }) {
  return (
    <TouchableOpacity
      onPress={item.onPress}
      style={[styles.swatch, item.selected && styles.swatchSelected]}
      accessibilityLabel={item.label}
    >
      {item.source ? (
        <Image source={item.source} style={styles.swatchImage} resizeMode="contain" />
      ) : (
        <AppIcon name="close" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

function SwatchGrid({ items }: { items: SwatchItem[] }) {
  return (
    <View style={styles.swatchGrid}>
      {items.map((item) => (
        <Swatch key={item.id} item={item} />
      ))}
    </View>
  );
}

function ColorDot({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) {
  const hex = COSMETIC_COLOR_HEX[color] ?? '#888';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.colorDot, selected && styles.colorDotSelected]}
      accessibilityLabel={color}
    >
      <View style={[styles.colorDotInner, { backgroundColor: hex }]} />
    </TouchableOpacity>
  );
}


export function ProfileAvatarScreen() {
  const { config, setConfig, save, saving } = useAvatarConfig();
  const [tab, setTab] = useState<Tab>('Raza');
  const { map: hatColors, setColor: setHatColor } = useItemColorMap('avatar:hatColors');
  const { map: clothesColors, setColor: setClothesColor } = useItemColorMap('avatar:clothesColors');

  function update(patch: Partial<AvatarConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function currentSkinIndex() {
    return RACE_SKINS[config.race].indexOf(config.skin);
  }

  function eyeColorForSkin(race: AvatarRace, skin: string) {
    const idx = RACE_SKINS[race].indexOf(skin);
    return EYE_COLORS[race][idx] ?? EYE_COLORS[race][0];
  }

  function renderTabContent() {
    switch (tab) {
      case 'Raza': {
        return (
          <View>
            <SwatchGrid
              items={RACES.map((race) => ({
                id: race,
                label: RACE_LABELS[race],
                source: getAsset(baseKey(race, RACE_SKINS[race][RACE_SKINS[race].length - 1])),
                selected: config.race === race,
                onPress: () => {
                  const idx = Math.min(currentSkinIndex(), RACE_SKINS[race].length - 1);
                  const skin = RACE_SKINS[race][idx];
                  update({ race, skin, eyeColor: eyeColorForSkin(race, skin) });
                },
              }))}
            />
            <View style={styles.raceLabels}>
              {RACES.map((race) => (
                <AppText
                  key={race}
                  variant="caption"
                  style={[styles.raceLabel, config.race === race && styles.raceLabelActive]}
                >
                  {RACE_LABELS[race]}
                </AppText>
              ))}
            </View>
          </View>
        );
      }

      case 'Piel': {
        return (
          <SwatchGrid
            items={RACE_SKINS[config.race].map((skin) => ({
              id: skin,
              label: skin,
              source: getAsset(baseKey(config.race, skin)),
              selected: config.skin === skin,
              onPress: () => update({ skin, eyeColor: eyeColorForSkin(config.race, skin) }),
            }))}
          />
        );
      }

      case 'Ojos': {
        return (
          <SwatchGrid
            items={EYE_STYLES.map((es) => ({
              id: `es_${es}`,
              label: es,
              source: getAsset(eyeKey(config.race, config.eyeColor, es)),
              selected: config.eyeStyle === es,
              onPress: () => update({ eyeStyle: es }),
            }))}
          />
        );
      }

      case 'Orejas': {
        return (
          <SwatchGrid
            items={EAR_STYLES.map((style) => ({
              id: style,
              label: style,
              source: getAsset(earsKey(config.race, config.skin, style)),
              selected: config.ears === style,
              onPress: () => update({ ears: style }),
            }))}
          />
        );
      }

      case 'Nariz': {
        return (
          <SwatchGrid
            items={NOSE_STYLES.map((style) => ({
              id: style,
              label: style,
              source: getAsset(noseKey(config.race, config.skin, style)),
              selected: config.nose === style,
              onPress: () => update({ nose: style }),
            }))}
          />
        );
      }

      case 'Boca': {
        return (
          <SwatchGrid
            items={MOUTH_STYLES.map((style) => ({
              id: style,
              label: style,
              source: getAsset(mouthKey(config.race, config.skin, style)),
              selected: config.mouth === style,
              onPress: () => update({ mouth: style }),
            }))}
          />
        );
      }

      case 'Cejas': {
        const activeBrowStyle = config.brows.split('_').slice(1).join('_');
        const browColor = config.brows.split('_')[0];
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={BROW_STYLES.map((style) => ({
                id: style,
                label: style,
                source: getAsset(browsKey(`${browColor}_${style}`)),
                selected: activeBrowStyle === style,
                onPress: () => update({ brows: `${browColor}_${style}` }),
              }))}
            />
            <View style={styles.colorChips}>
              {BROW_COLORS.map((color) => (
                <ColorDot key={color} color={color} selected={browColor === color}
                  onPress={() => update({ brows: `${color}_${activeBrowStyle}` })} />
              ))}
            </View>
          </View>
        );
      }

      case 'Pelo': {
        const activeHairStyle = config.hair ? config.hair.split('_').slice(1).join('_') : null;
        const hairColor = config.hair ? config.hair.split('_')[0] : null;
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={[
                { id: '__none', label: 'Ninguno', source: null, selected: config.hair === null, onPress: () => update({ hair: null }) },
                ...HAIR_STYLES.map((style) => ({
                  id: style,
                  label: style,
                  source: getAsset(hairKey(`${hairColor ?? HAIR_COLORS[0]}_${style}`)),
                  selected: activeHairStyle === style,
                  onPress: () => update({ hair: `${hairColor ?? HAIR_COLORS[0]}_${style}` }),
                })),
              ]}
            />
            {activeHairStyle && (
              <View style={styles.colorChips}>
                {HAIR_COLORS.map((color) => (
                  <ColorDot key={color} color={color} selected={hairColor === color}
                    onPress={() => update({ hair: `${color}_${activeHairStyle}` })} />
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'Barba': {
        const activeBeardStyle = config.beard ? config.beard.split('_').slice(1).join('_') : null;
        const beardColor = config.beard ? config.beard.split('_')[0] : null;
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={[
                { id: '__none', label: 'Ninguno', source: null, selected: config.beard === null, onPress: () => update({ beard: null }) },
                ...BEARD_STYLES.map((style) => ({
                  id: style,
                  label: style,
                  source: getAsset(beardKey(`${beardColor ?? BEARD_COLORS[0]}_${style}`)),
                  selected: activeBeardStyle === style,
                  onPress: () => update({ beard: `${beardColor ?? BEARD_COLORS[0]}_${style}` }),
                })),
              ]}
            />
            {activeBeardStyle && (
              <View style={styles.colorChips}>
                {BEARD_COLORS.map((color) => (
                  <ColorDot key={color} color={color} selected={beardColor === color}
                    onPress={() => update({ beard: `${color}_${activeBeardStyle}` })} />
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'Bigote': {
        const activeMoustacheStyle = config.moustache ? config.moustache.split('_').slice(1).join('_') : null;
        const moustacheColor = config.moustache ? config.moustache.split('_')[0] : null;
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={[
                { id: '__none', label: 'Ninguno', source: null, selected: config.moustache === null, onPress: () => update({ moustache: null }) },
                ...MOUSTACHE_STYLES.map((style) => ({
                  id: style,
                  label: style,
                  source: getAsset(moustacheKey(`${moustacheColor ?? MOUSTACHE_COLORS[0]}_${style}`)),
                  selected: activeMoustacheStyle === style,
                  onPress: () => update({ moustache: `${moustacheColor ?? MOUSTACHE_COLORS[0]}_${style}` }),
                })),
              ]}
            />
            {activeMoustacheStyle && (
              <View style={styles.colorChips}>
                {MOUSTACHE_COLORS.map((color) => (
                  <ColorDot key={color} color={color} selected={moustacheColor === color}
                    onPress={() => update({ moustache: `${color}_${activeMoustacheStyle}` })} />
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'Ropa': {
        const clothesSep = config.clothes ? config.clothes.lastIndexOf('_') : -1;
        const activeClothesStyle = clothesSep >= 0 ? config.clothes!.slice(clothesSep + 1) : null;
        const clothesColor = clothesSep >= 0 ? config.clothes!.slice(0, clothesSep) : null;
        const validClothesColors = activeClothesStyle
          ? CLOTHES_COLORS.filter((c) => getAsset(clothesKey(`${c}_${activeClothesStyle}`)) !== null)
          : [];
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={[
                { id: '__none', label: 'Ninguno', source: null, selected: config.clothes === null, onPress: () => update({ clothes: null }) },
                ...CLOTHES_STYLES.map((style) => {
                  const savedColor = clothesColors[style];
                  const firstColor = CLOTHES_COLORS.find((c) => getAsset(clothesKey(`${c}_${style}`)) !== null) ?? null;
                  if (!firstColor) return null;
                  const previewColor = style === activeClothesStyle
                    ? (clothesColor ?? savedColor ?? firstColor)
                    : (savedColor && getAsset(clothesKey(`${savedColor}_${style}`)) !== null ? savedColor : firstColor);
                  const source = getAsset(clothesKey(`${previewColor}_${style}`));
                  if (source === null) return null;
                  return {
                    id: style,
                    label: style,
                    source,
                    selected: activeClothesStyle === style,
                    onPress: () => {
                      const color = savedColor && getAsset(clothesKey(`${savedColor}_${style}`)) !== null
                        ? savedColor
                        : firstColor;
                      update({ clothes: `${color}_${style}` });
                    },
                  };
                }).filter((i): i is SwatchItem => i !== null),
              ]}
            />
            {activeClothesStyle && validClothesColors.length > 0 && (
              <View style={styles.colorChips}>
                {validClothesColors.map((color) => (
                  <ColorDot
                    key={color}
                    color={color}
                    selected={clothesColor === color}
                    onPress={() => {
                      setClothesColor(activeClothesStyle, color);
                      update({ clothes: `${color}_${activeClothesStyle}` });
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'Gorro': {
        const hatSep = config.hat ? config.hat.lastIndexOf('_') : -1;
        const activeHatStyle = hatSep >= 0 ? config.hat!.slice(hatSep + 1) : null;
        const hatColor = hatSep >= 0 ? config.hat!.slice(0, hatSep) : null;
        const validHatColors = activeHatStyle
          ? HAT_COLORS.filter((c) => getAsset(hatKey(`${c}_${activeHatStyle}`)) !== null)
          : [];
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={[
                { id: '__none', label: 'Ninguno', source: null, selected: config.hat === null, onPress: () => update({ hat: null }) },
                ...HAT_STYLES.map((style) => {
                  const savedColor = hatColors[style];
                  const firstColor = HAT_COLORS.find((c) => getAsset(hatKey(`${c}_${style}`)) !== null) ?? null;
                  if (!firstColor) return null;
                  const previewColor = style === activeHatStyle
                    ? (hatColor ?? savedColor ?? firstColor)
                    : (savedColor && getAsset(hatKey(`${savedColor}_${style}`)) !== null ? savedColor : firstColor);
                  const source = getAsset(hatKey(`${previewColor}_${style}`));
                  if (source === null) return null;
                  return {
                    id: style,
                    label: style,
                    source,
                    selected: activeHatStyle === style,
                    onPress: () => {
                      const color = savedColor && getAsset(hatKey(`${savedColor}_${style}`)) !== null
                        ? savedColor
                        : firstColor;
                      update({ hat: `${color}_${style}` });
                    },
                  };
                }).filter((i): i is SwatchItem => i !== null),
              ]}
            />
            {activeHatStyle && validHatColors.length > 0 && (
              <View style={styles.colorChips}>
                {validHatColors.map((color) => (
                  <ColorDot
                    key={color}
                    color={color}
                    selected={hatColor === color}
                    onPress={() => {
                      setHatColor(activeHatStyle, color);
                      update({ hat: `${color}_${activeHatStyle}` });
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        );
      }

      case 'Fondo': {
        const activeBgStyle = config.bg.startsWith('light_') ? 'light' : 'normal';
        const activeBgColor = config.bg.startsWith('light_') ? config.bg.slice(6) : config.bg;
        return (
          <View style={styles.twoSection}>
            <SwatchGrid
              items={BG_STYLES.map((style) => ({
                id: style,
                label: style,
                source: getAsset(bgKey(bgAssetName(style, activeBgColor))),
                selected: activeBgStyle === style,
                onPress: () => update({ bg: bgAssetName(style, activeBgColor) }),
              }))}
            />
            <View style={styles.colorChips}>
              {BG_COLORS.map((color) => (
                <ColorDot
                  key={color}
                  color={color}
                  selected={activeBgColor === color}
                  onPress={() => update({ bg: bgAssetName(activeBgStyle, color) })}
                />
              ))}
            </View>
          </View>
        );
      }
    }
  }

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

      <View style={styles.previewContainer}>
        <AvatarComposer config={config} size={AVATAR_SIZE} blink />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((t) => (
          <AppChip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </ScrollView>

      <ScrollView style={styles.selectorScroll} contentContainerStyle={styles.selectorContent}>
        {renderTabContent()}
      </ScrollView>

      <View style={styles.footerActions}>
        <AppButton label="Cancelar" variant="outline" onPress={() => router.back()} />
        <AppButton
          label={saving ? 'Guardando...' : 'Guardar avatar'}
          onPress={async () => { await save(config); router.back(); }}
          style={styles.primaryAction}
        />
      </View>
    </ProfileScreenContainer>
  );
}

export default ProfileAvatarScreen;

const styles = StyleSheet.create({
  previewContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s4,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsContent: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s1,
  },
  selectorScroll: {
    flex: 1,
  },
  selectorContent: {
    paddingVertical: theme.spacing.s3,
  },
  colorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
    paddingBottom: theme.spacing.s3,
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  colorDotInner: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
    justifyContent: 'center',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swatchSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  swatchImage: {
    width: SWATCH_SIZE - 4,
    height: SWATCH_SIZE - 4,
  },
  twoSection: {
    gap: theme.spacing.s1,
  },
  sectionLabel: {
    marginBottom: theme.spacing.s1,
  },
  sectionLabelGap: {
    marginTop: theme.spacing.s3,
  },
  raceLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
    marginTop: theme.spacing.s2,
  },
  raceLabel: {
    width: SWATCH_SIZE,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  raceLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
    paddingTop: theme.spacing.s3,
  },
  primaryAction: {
    flex: 1,
  },
});
