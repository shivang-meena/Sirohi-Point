import type { Product } from '@sirohi/contracts';
import { radius, type ThemeColors } from '@sirohi/design-tokens';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useThemedStyles } from '@/theme/theme-context';

export function ProductVisual({
  product,
  compact = false,
  style,
}: {
  product: Product;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  // New products receive an uploaded image URL. Older products do not, so give
  // each of them a stable placeholder photo instead of an initials-only card.
  // The seed keeps the same placeholder assigned to the same product.
  const source = {
    uri: product.imageUrl || `https://picsum.photos/seed/sirohi-product-${encodeURIComponent(product.id)}/800/800`,
  };
  return (
    <View style={[styles.visual, compact && styles.visualCompact, style]}>
      <Image source={source} resizeMode="cover" style={styles.image} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  visual: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFFFF',
  },
  visualCompact: {
    minHeight: 0,
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: { width: '100%', height: '100%', borderRadius: radius.md, backgroundColor: '#FFFFFF' },
});
