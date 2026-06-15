import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import {
  AppCard,
  AppCardDescription,
  AppCardEyebrow,
  AppCardHeader,
  AppCardHeaderText,
  AppIcon,
  theme,
} from '@/src/ui';

type Props = {
  text: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Tarjeta "¿Sabías que...?" que muestra un dato curioso.
 * Componente presentacional reutilizable en el flujo de reciclaje.
 * @param text - Texto del dato curioso a mostrar.
 * @param style - Estilo opcional para sobreescribir el contenedor.
 */
export function FunFactCard({ text, style }: Props) {
  return (
    <AppCard variant="info" padding="md" elevation="xs" style={[styles.card, style]}>
      <AppCardHeader
        leading={<AppIcon name="info" size={theme.iconSizes.md} color={theme.colors.info} />}
      >
        <AppCardHeaderText>
          <AppCardEyebrow style={styles.eyebrow}>¿Sabías que...?</AppCardEyebrow>
          <AppCardDescription>{text}</AppCardDescription>
        </AppCardHeaderText>
      </AppCardHeader>
    </AppCard>
  );
}

export default FunFactCard;

const styles = StyleSheet.create({
  card: {
    marginTop: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.info,
  },
});
