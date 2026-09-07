import type { Product } from '@sirohi/contracts';
import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { formatMoney } from '@sirohi/domain';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductVisual } from '@/components/product-visual';
import { StarRating } from '@/components/star-rating';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useCustomerStyles as useThemedStyles } from '@/theme/customer-theme';

export function ProductCard({ product, width }: { product: Product; width: number | `${number}%` }) {
  const router = useRouter();
  const { cart, addToCart, decrement, toggleWishlist, wishlist, showNotice } = useAppState();
  const { user } = useAuth();
  const styles = useThemedStyles(createStyles);
  const saved = wishlist.includes(product.id);
  const quantity = cart[product.id] ?? 0;
  const discount = product.compareAtPriceInPaise
    ? Math.round((1 - product.priceInPaise / product.compareAtPriceInPaise) * 100)
    : 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  function requireCustomer() {
    if (user?.role === 'CUSTOMER') return true;
    showNotice('Sign in as a customer to buy products.');
    router.replace('/customer/login' as never);
    return false;
  }

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        style={({ pressed }) => [styles.visualLink, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`View ${product.name}`}
      >
        <ProductVisual product={product} />
        {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={(event) => { event.stopPropagation(); toggleWishlist(product.id); }}
          hitSlop={8}
          style={[styles.heart, saved && styles.heartSaved]}
          accessibilityLabel={`${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`}
        >
          <Text style={[styles.heartText, saved && styles.heartTextSaved]}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </Pressable>
      <View style={styles.info}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{product.category}</Text>
          {product.serviceAvailable ? <View style={styles.servicePill}><Text style={styles.servicePillText}>INSTALLATION</Text></View> : null}
        </View>
        <Pressable onPress={() => router.push(`/product/${product.id}`)}>
          <Text style={styles.name} numberOfLines={2}>
            <Text style={styles.brand}>{product.brand}</Text> {product.name}
          </Text>
        </Pressable>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoney(product.priceInPaise)}</Text>
          {product.compareAtPriceInPaise ? <Text style={styles.compare}>{formatMoney(product.compareAtPriceInPaise)}</Text> : null}
          {discount ? <Text style={styles.discount}>{discount}% off</Text> : null}
        </View>
        <Text style={[styles.stock, lowStock && styles.stockLow]}>{lowStock ? `Only ${product.stock} left` : 'In stock'}</Text>

        {quantity > 0 ? (
          <View style={styles.quantityControl} accessibilityLabel={`${quantity} ${product.name} in cart`}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Decrease ${product.name} quantity`}
              style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}
              onPress={() => decrement(product.id)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>
            <Text style={styles.quantityNumber}>{quantity} in cart</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Increase ${product.name} quantity`}
              style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}
              onPress={() => { if (requireCustomer()) addToCart(product); }}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={() => { if (requireCustomer()) addToCart(product); }}
          >
            <Text style={styles.addButtonText}>Add to cart</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    minWidth: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  visualLink: { minHeight: 220, padding: spacing.sm, backgroundColor: colors.surfaceRaised },
  badge: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    color: '#FFFFFF',
    backgroundColor: colors.cta,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    overflow: 'hidden',
  },
  heart: {
    position: 'absolute', right: spacing.md, top: spacing.md, width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  heartSaved: { borderColor: colors.cta, backgroundColor: colors.copperTint },
  heartText: { color: colors.muted, fontSize: 19, lineHeight: 21 },
  heartTextSaved: { color: colors.cta },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  category: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 1 },
  servicePill: { backgroundColor: colors.tealTint, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  servicePillText: { color: colors.teal, fontSize: 8, fontWeight: '900', letterSpacing: 0.45 },
  info: { padding: spacing.lg, paddingTop: spacing.md, gap: 8, flex: 1 },
  brand: { color: colors.teal, fontSize: 14.5, fontWeight: '900' },
  name: { color: colors.cream, fontSize: 14.5, lineHeight: 20, fontWeight: '600', minHeight: 40 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 7, marginTop: 2, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceSunken },
  price: { color: colors.cream, fontSize: 21, fontWeight: '900', letterSpacing: -0.3 },
  compare: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' },
  discount: { color: colors.success, fontSize: 11.5, fontWeight: '900' },
  stock: { color: colors.success, fontSize: 11.5, fontWeight: '800', marginTop: 1 },
  stockLow: { color: colors.danger },
  addButton: { marginTop: 5, minHeight: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.cta, shadowColor: colors.cta, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 7, elevation: 2 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  quantityControl: { marginTop: 5, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.cta, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.copperTint, paddingHorizontal: 4 },
  quantityButton: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cta },
  quantityButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', lineHeight: 18 },
  quantityNumber: { color: colors.cream, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});

