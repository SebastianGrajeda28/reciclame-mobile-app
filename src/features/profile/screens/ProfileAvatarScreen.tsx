import React, { useState } from 'react';
import { useItemColorMap } from '@/src/features/profile/hooks/useItemColorMap';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

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
import { COSMETIC_COLOR_HEX, SKIN_COLOR_HEX } from '@/src/features/profile/data/avatarCatalog';
import { AppButton, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type Tab = 'Raza' | 'Piel' | 'Ojos' | 'Orejas' | 'Nariz' | 'Boca' | 'Cejas' | 'Pelo' | 'Barba' | 'Bigote' | 'Ropa' | 'Gorro' | 'Fondo';
type Group = 'General' | 'Rasgos' | 'Cabello' | 'Vestimenta';

const GROUPS: Group[] = ['General', 'Rasgos', 'Cabello', 'Vestimenta'];

const GROUP_TABS: Record<Group, Tab[]> = {
  General:    ['Raza', 'Fondo'],
  Rasgos:     ['Orejas', 'Ojos', 'Nariz', 'Boca'],
  Cabello:    ['Pelo', 'Cejas', 'Barba', 'Bigote'],
  Vestimenta: ['Ropa', 'Gorro'],
};

const AVATAR_SIZE = 224;
const SWATCH_SIZE = 56;
const RACE_SWATCH_SIZE = 56;
const COLOR_COLUMNS = 10;
const COLOR_DOT_SIZE = 36;
const COLOR_DOT_GAP = 6;

// ─── Types ───────────────────────────────────────────────────────────────────

type SwatchItem = {
  id: string;
  label?: string;
  source?: number | null;
  selected: boolean;
  onPress: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "color_style" compound strings where color is the first segment. */
function parseSimpleColorStyle(value: string | null): { color: string | null; style: string | null } {
  if (!value) return { color: null, style: null };
  const parts = value.split('_');
  return { color: parts[0], style: parts.slice(1).join('_') || null };
}

/** Parse "color_style" compound strings where style is the last segment (handles leather colors). */
function parseCompoundColorStyle(value: string | null): { color: string | null; style: string | null } {
  if (!value) return { color: null, style: null };
  const sep = value.lastIndexOf('_');
  if (sep < 0) return { color: null, style: null };
  return { color: value.slice(0, sep), style: value.slice(sep + 1) };
}

/** Build swatch items for nullable cosmetic (Pelo/Barba/Bigote/Ropa/Gorro). */
function buildNullableSwatchItems(
  activeStyle: string | null,
  activeColor: string | null,
  defaultColor: string,
  styles: string[],
  keyFn: (colorAndStyle: string) => string,
  updateFn: (value: string) => void,
  nullUpdateFn: () => void,
  isNull: boolean,
): SwatchItem[] {
  return [
    { id: '__none', label: 'Ninguno', source: null, selected: isNull, onPress: nullUpdateFn },
    ...styles.map((style) => ({
      id: style,
      label: style,
      source: getAsset(keyFn(`${activeColor ?? defaultColor}_${style}`)),
      selected: activeStyle === style,
      onPress: () => updateFn(`${activeColor ?? defaultColor}_${style}`),
    })),
  ];
}

/** Build swatch items for color-per-style cosmetics (Ropa/Gorro) using saved color memory. */
function buildColoredStyleItems(
  activeStyle: string | null,
  activeColor: string | null,
  availableColors: string[],
  availableStyles: string[],
  savedColorMap: Record<string, string>,
  keyFn: (colorAndStyle: string) => string,
  updateFn: (colorAndStyle: string) => void,
  saveColorFn: (style: string, color: string) => void,
  nullUpdateFn: () => void,
  isNull: boolean,
): SwatchItem[] {
  return [
    { id: '__none', label: 'Ninguno', source: null, selected: isNull, onPress: nullUpdateFn },
    ...availableStyles.map((style) => {
      const savedColor = savedColorMap[style];
      const firstColor = availableColors.find((c) => getAsset(keyFn(`${c}_${style}`)) !== null) ?? null;
      if (!firstColor) return null;
      const previewColor = style === activeStyle
        ? (activeColor ?? savedColor ?? firstColor)
        : (savedColor && getAsset(keyFn(`${savedColor}_${style}`)) !== null ? savedColor : firstColor);
      const source = getAsset(keyFn(`${previewColor}_${style}`));
      if (source === null) return null;
      return {
        id: style,
        label: style,
        source,
        selected: activeStyle === style,
        onPress: () => {
          const color = savedColor && getAsset(keyFn(`${savedColor}_${style}`)) !== null
            ? savedColor : firstColor;
          saveColorFn(style, color);
          updateFn(`${color}_${style}`);
        },
      };
    }).filter((i): i is NonNullable<typeof i> => i !== null),
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar({ items, activeItem, onSelect, variant }: {
  items: string[];
  activeItem: string;
  onSelect: (item: string) => void;
  variant: 'group' | 'sub';
}) {
  const isGroup = variant === 'group';
  return (
    <View style={isGroup ? styles.groupTabs : styles.subTabs}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[isGroup ? styles.groupTab : styles.subTab, activeItem === item && (isGroup ? styles.groupTabActive : styles.subTabActive)]}
          onPress={() => onSelect(item)}
        >
          <AppText
            variant="caption"
            style={[isGroup ? styles.groupTabLabel : styles.subTabLabel, activeItem === item && (isGroup ? styles.groupTabLabelActive : styles.subTabLabelActive)]}
          >
            {item}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Swatch({ item, showLabel }: { item: SwatchItem; showLabel?: boolean }) {
  return (
    <View style={styles.swatchWrapper}>
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
      {showLabel && item.label ? (
        <AppText variant="caption" style={[styles.swatchLabel, item.selected && styles.swatchLabelActive]}>
          {item.label}
        </AppText>
      ) : null}
    </View>
  );
}

function SwatchGrid({ items, showLabels }: { items: SwatchItem[]; showLabels?: boolean }) {
  return (
    <View style={styles.swatchGrid}>
      {items.map((item) => (
        <Swatch key={item.id} item={item} showLabel={showLabels} />
      ))}
    </View>
  );
}

function ColorDot({ color, selected, onPress, hexOverride }: { color: string; selected: boolean; onPress: () => void; hexOverride?: string }) {
  const hex = hexOverride ?? COSMETIC_COLOR_HEX[color] ?? '#888';
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ProfileAvatarScreen() {
  const { config, setConfig, save, saving, hasChanges } = useAvatarConfig();
  const [group, setGroup] = useState<Group>('General');
  const [tab, setTab] = useState<Tab>('Raza');
  const { map: hatColors, setColor: setHatColor } = useItemColorMap('avatar:hatColors');
  const { map: clothesColors, setColor: setClothesColor } = useItemColorMap('avatar:clothesColors');
  const { map: raceSkins, setColor: setRaceSkin } = useItemColorMap('avatar:raceSkins');
  const { map: hairColors, setColor: setHairColor } = useItemColorMap('avatar:hairColors');
  const { map: beardColors, setColor: setBeardColor } = useItemColorMap('avatar:beardColors');
  const { map: moustacheColors, setColor: setMoustacheColor } = useItemColorMap('avatar:moustacheColors');

  function selectGroup(g: Group) {
    setGroup(g);
    setTab(GROUP_TABS[g][0]);
  }

  function update(patch: Partial<AvatarConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function eyeColorForSkin(race: AvatarRace, skin: string) {
    const idx = RACE_SKINS[race].indexOf(skin);
    return EYE_COLORS[race][idx] ?? EYE_COLORS[race][0];
  }

  function getColorDots(): React.ReactElement<typeof ColorDot>[] | null {
    switch (tab) {
      case 'Raza': {
        return RACE_SKINS[config.race].map((skin) => (
          <ColorDot
            key={skin}
            color={skin}
            hexOverride={SKIN_COLOR_HEX[skin]}
            selected={config.skin === skin}
            onPress={() => {
              setRaceSkin(config.race, skin);
              update({ skin, eyeColor: eyeColorForSkin(config.race, skin) });
            }}
          />
        ));
      }
      case 'Cejas': {
        const { color: browColor, style: activeBrowStyle } = parseSimpleColorStyle(config.brows);
        return BROW_COLORS.map((color) => (
          <ColorDot key={color} color={color} selected={browColor === color}
            onPress={() => update({ brows: `${color}_${activeBrowStyle}` })} />
        ));
      }
      case 'Pelo': {
        const { color: hairColor, style: activeHairStyle } = parseSimpleColorStyle(config.hair);
        const resolvedHairColor = hairColor ?? hairColors['color'] ?? HAIR_COLORS[0];
        if (!activeHairStyle && !hairColors['color']) return null;
        return HAIR_COLORS.map((color) => (
          <ColorDot key={color} color={color} selected={resolvedHairColor === color}
            onPress={() => { setHairColor('color', color); if (activeHairStyle) update({ hair: `${color}_${activeHairStyle}` }); }} />
        ));
      }
      case 'Barba': {
        const { color: beardColor, style: activeBeardStyle } = parseSimpleColorStyle(config.beard);
        const resolvedBeardColor = beardColor ?? beardColors['color'] ?? BEARD_COLORS[0];
        if (!activeBeardStyle && !beardColors['color']) return null;
        return BEARD_COLORS.map((color) => (
          <ColorDot key={color} color={color} selected={resolvedBeardColor === color}
            onPress={() => { setBeardColor('color', color); if (activeBeardStyle) update({ beard: `${color}_${activeBeardStyle}` }); }} />
        ));
      }
      case 'Bigote': {
        const { color: moustacheColor, style: activeMoustacheStyle } = parseSimpleColorStyle(config.moustache);
        const resolvedMoustacheColor = moustacheColor ?? moustacheColors['color'] ?? MOUSTACHE_COLORS[0];
        if (!activeMoustacheStyle && !moustacheColors['color']) return null;
        return MOUSTACHE_COLORS.map((color) => (
          <ColorDot key={color} color={color} selected={resolvedMoustacheColor === color}
            onPress={() => { setMoustacheColor('color', color); if (activeMoustacheStyle) update({ moustache: `${color}_${activeMoustacheStyle}` }); }} />
        ));
      }
      case 'Ropa': {
        const { color: clothesColor, style: activeClothesStyle } = parseCompoundColorStyle(config.clothes);
        if (!activeClothesStyle) return null;
        const valid = CLOTHES_COLORS.filter((c) => getAsset(clothesKey(`${c}_${activeClothesStyle}`)) !== null);
        if (valid.length === 0) return null;
        return valid.map((color) => (
          <ColorDot key={color} color={color} selected={clothesColor === color}
            onPress={() => { setClothesColor(activeClothesStyle, color); update({ clothes: `${color}_${activeClothesStyle}` }); }} />
        ));
      }
      case 'Gorro': {
        const { color: hatColor, style: activeHatStyle } = parseCompoundColorStyle(config.hat);
        if (!activeHatStyle) return null;
        const valid = HAT_COLORS.filter((c) => getAsset(hatKey(`${c}_${activeHatStyle}`)) !== null);
        if (valid.length === 0) return null;
        return valid.map((color) => (
          <ColorDot key={color} color={color} selected={hatColor === color}
            onPress={() => { setHatColor(activeHatStyle, color); update({ hat: `${color}_${activeHatStyle}` }); }} />
        ));
      }
      case 'Fondo': {
        const activeBgStyle = config.bg.startsWith('light_') ? 'light' : 'normal';
        const activeBgColor = config.bg.startsWith('light_') ? config.bg.slice(6) : config.bg;
        return BG_COLORS.map((color) => (
          <ColorDot key={color} color={color} selected={activeBgColor === color}
            onPress={() => update({ bg: bgAssetName(activeBgStyle, color) })} />
        ));
      }
      default:
        return null;
    }
  }

  function renderTabContent() {
    switch (tab) {
      case 'Raza': {
        return (
          <View style={styles.raceGrid}>
            {RACES.map((race) => {
              const savedSkin = raceSkins[race];
              const skin = race === config.race
                ? config.skin
                : (savedSkin && RACE_SKINS[race].includes(savedSkin))
                  ? savedSkin
                  : RACE_SKINS[race][0];
              const racePreviewConfig: AvatarConfig = {
                ...config,
                race,
                skin,
                eyeColor: eyeColorForSkin(race, skin),
                hat: null,
                clothes: null,
                hair: null,
                beard: null,
                moustache: null,
              };
              const isSelected = config.race === race;
              return (
                <View key={race} style={styles.swatchWrapper}>
                  <TouchableOpacity
                    style={[styles.raceSwatch, isSelected && styles.raceSwatchSelected]}
                    onPress={() => update({ race, skin, eyeColor: eyeColorForSkin(race, skin) })}
                  >
                    <AvatarComposer config={racePreviewConfig} size={RACE_SWATCH_SIZE} blink={false} showBg={false} />
                  </TouchableOpacity>
                  <AppText variant="caption" style={[styles.swatchLabel, isSelected && styles.swatchLabelActive]}>
                    {RACE_LABELS[race]}
                  </AppText>
                </View>
              );
            })}
          </View>
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
        const { color: browColor, style: activeBrowStyle } = parseSimpleColorStyle(config.brows);
        return (
          <SwatchGrid
            items={BROW_STYLES.map((style) => ({
              id: style,
              label: style,
              source: getAsset(browsKey(`${browColor}_${style}`)),
              selected: activeBrowStyle === style,
              onPress: () => update({ brows: `${browColor}_${style}` }),
            }))}
          />
        );
      }

      case 'Pelo': {
        const { color: hairColor, style: activeHairStyle } = parseSimpleColorStyle(config.hair);
        const savedHairColor = hairColor ?? hairColors['color'] ?? HAIR_COLORS[0];
        return (
          <SwatchGrid
            items={buildNullableSwatchItems(
              activeHairStyle, savedHairColor, HAIR_COLORS[0],
              HAIR_STYLES, hairKey,
              (v) => { setHairColor('color', savedHairColor); update({ hair: v }); },
              () => update({ hair: null }),
              config.hair === null,
            )}
          />
        );
      }

      case 'Barba': {
        const { color: beardColor, style: activeBeardStyle } = parseSimpleColorStyle(config.beard);
        const savedBeardColor = beardColor ?? beardColors['color'] ?? BEARD_COLORS[0];
        return (
          <SwatchGrid
            items={buildNullableSwatchItems(
              activeBeardStyle, savedBeardColor, BEARD_COLORS[0],
              BEARD_STYLES, beardKey,
              (v) => { setBeardColor('color', savedBeardColor); update({ beard: v }); },
              () => update({ beard: null }),
              config.beard === null,
            )}
          />
        );
      }

      case 'Bigote': {
        const { color: moustacheColor, style: activeMoustacheStyle } = parseSimpleColorStyle(config.moustache);
        const savedMoustacheColor = moustacheColor ?? moustacheColors['color'] ?? MOUSTACHE_COLORS[0];
        return (
          <SwatchGrid
            items={buildNullableSwatchItems(
              activeMoustacheStyle, savedMoustacheColor, MOUSTACHE_COLORS[0],
              MOUSTACHE_STYLES, moustacheKey,
              (v) => { setMoustacheColor('color', savedMoustacheColor); update({ moustache: v }); },
              () => update({ moustache: null }),
              config.moustache === null,
            )}
          />
        );
      }

      case 'Ropa': {
        const { color: clothesColor, style: activeClothesStyle } = parseCompoundColorStyle(config.clothes);
        return (
          <SwatchGrid
            items={buildColoredStyleItems(
              activeClothesStyle, clothesColor,
              CLOTHES_COLORS, CLOTHES_STYLES,
              clothesColors, clothesKey,
              (v) => update({ clothes: v }),
              (style, color) => setClothesColor(style, color),
              () => update({ clothes: null }),
              config.clothes === null,
            )}
          />
        );
      }

      case 'Gorro': {
        const { color: hatColor, style: activeHatStyle } = parseCompoundColorStyle(config.hat);
        return (
          <SwatchGrid
            items={buildColoredStyleItems(
              activeHatStyle, hatColor,
              HAT_COLORS, HAT_STYLES,
              hatColors, hatKey,
              (v) => update({ hat: v }),
              (style, color) => setHatColor(style, color),
              () => update({ hat: null }),
              config.hat === null,
            )}
          />
        );
      }

      case 'Fondo': {
        const activeBgStyle = config.bg.startsWith('light_') ? 'light' : 'normal';
        const activeBgColor = config.bg.startsWith('light_') ? config.bg.slice(6) : config.bg;
        return (
          <SwatchGrid
            showLabels
            items={BG_STYLES.map((style) => ({
              id: style,
              label: style === 'light' ? 'Con círculo' : 'Plano',
              source: getAsset(bgKey(bgAssetName(style, activeBgColor))),
              selected: activeBgStyle === style,
              onPress: () => update({ bg: bgAssetName(style, activeBgColor) }),
            }))}
          />
        );
      }
    }
  }

  const colorDots = getColorDots();

  return (
    <ProfileScreenContainer
      footer={
        <AppButton
          label={saving ? 'Guardando...' : 'Guardar cambios'}
          onPress={async () => {
            try {
              await save(config);
              router.back();
            } catch {
              Alert.alert('Error al guardar', 'No se pudo guardar el avatar. Intenta nuevamente.');
            }
          }}
          style={styles.primaryAction}
          disabled={!hasChanges || saving}
        />
      }
    >
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

      <View style={styles.tabsContainer}>
        <TabBar items={GROUPS} activeItem={group} onSelect={(g) => selectGroup(g as Group)} variant="group" />
        <TabBar items={GROUP_TABS[group]} activeItem={tab} onSelect={(t) => setTab(t as Tab)} variant="sub" />
      </View>

      <View style={styles.selectorCard}>
        <AppText variant="caption" style={styles.cardLabel}>Estilo</AppText>
        <ScrollView style={styles.selectorScroll} contentContainerStyle={styles.selectorContent}>
          {renderTabContent()}
        </ScrollView>
      </View>

      {colorDots ? (
        <View style={styles.colorCard}>
          <View style={styles.colorAreaHeader}>
            <AppText variant="caption" style={styles.cardLabel}>Color</AppText>
          </View>
          <View style={styles.colorChips}>{colorDots}</View>
        </View>
      ) : null}

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
  tabsContainer: {
    gap: 0,
  },
  groupTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groupTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.s2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  groupTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  groupTabLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium,
    fontSize: 14,
  },
  groupTabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  subTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.s2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  subTabLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium,
    fontSize: 14,
  },
  subTabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  selectorScroll: {
    flex: 1,
    alignSelf: 'stretch',
  },
  selectorContent: {
    paddingVertical: theme.spacing.s3,
    alignItems: 'center',
  },
  colorAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COLOR_DOT_GAP,
    justifyContent: 'center',
    maxWidth: COLOR_COLUMNS * COLOR_DOT_SIZE + (COLOR_COLUMNS - 1) * COLOR_DOT_GAP,
  },
  colorDot: {
    width: COLOR_DOT_SIZE,
    height: COLOR_DOT_SIZE,
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
    width: COLOR_DOT_SIZE - 10,
    height: COLOR_DOT_SIZE - 10,
    borderRadius: theme.radius.full,
  },
  raceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s3,
    justifyContent: 'center',
  },
  raceSwatch: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    overflow: 'hidden',
  },
  raceSwatchSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
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
  swatchWrapper: {
    alignItems: 'center',
    gap: 3,
  },
  swatchLabel: {
    width: SWATCH_SIZE,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  swatchLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  selectorCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.s2,
    gap: theme.spacing.s1,
    alignItems: 'center',
  },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  colorCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.s3,
    paddingTop: theme.spacing.s2,
    paddingBottom: theme.spacing.s3,
    gap: theme.spacing.s1,
    alignItems: 'center',
  },
  primaryAction: {
    width: '100%',
  },
});
