import { formatMoney } from '@sirohi/domain';
import type { ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { ProductVisual } from '@/components/product-visual';
import { getB2BProduct } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { addToCart } = useAppState();
  const { token, user } = useAuth();
  const liveProduct = useQuery({ queryKey: ['catalog', 'b2b', id], queryFn: () => getB2BProduct(token!, id), enabled: user?.role === 'BUSINESS' && Boolean(token) && Boolean(id) });
  const product = liveProduct.data;
  const minimum = product?.minimumB2BQuantity ?? 1;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) setQuantity((current) => Math.max(product.minimumB2BQuantity ?? 1, current));
  }, [product?.minimumB2BQuantity, product?.id]);

  if (liveProduct.isLoading) return <PortalShell eyebrow="B2B CATALOGUE" title="Loading product details…" copy="Reading the current B2B price, MOQ, and stock from the backend."><PortalCard title="Loading product data…" /></PortalShell>;
  if (!product) return <PortalShell eyebrow="B2B CATALOGUE" title={liveProduct.isError ? 'Product details unavailable' : 'Product not found'} copy={liveProduct.isError && liveProduct.error instanceof Error ? liveProduct.error.message : 'Return to the business catalogue to choose another product.'}><PortalButton label="Back to B2B catalogue" onPress={() => router.replace('/business/catalog' as never)} /></PortalShell>;

  const b2bPrice = product.b2bPriceInPaise ?? product.priceInPaise;
  const total = b2bPrice * quantity;
  return <PortalShell eyebrow="B2B PRODUCT DETAIL" title={product.name} copy={`${product.brand} · ${product.category}`} actions={<PortalButton label="Back to catalogue" secondary onPress={() => router.back()} />}>
    <View style={styles.columns}>
      <PortalCard><ProductVisual product={product} /><View style={styles.productInfo}><Text style={styles.brand}>{product.brand}</Text><Text style={styles.name}>{product.name}</Text><Text style={styles.description}>{product.description}</Text></View></PortalCard>
      <PortalCard title="Business buying terms" copy="The backend will validate this pricing and quantity again when the order is submitted.">
        <View style={styles.priceBlock}><Text style={styles.price}>{formatMoney(b2bPrice)}</Text><Text style={styles.priceLabel}>B2B unit price</Text></View>
        <View style={styles.termRow}><Text style={styles.termLabel}>Minimum order quantity</Text><Text style={styles.termValue}>{minimum} units</Text></View>
        <View style={styles.termRow}><Text style={styles.termLabel}>Available quantity</Text><Text style={styles.termValue}>{product.stock} units</Text></View>
        <StatusBadge label={product.allowB2BBackorder ? 'More than stock can be requested' : 'Order within available stock'} tone={product.allowB2BBackorder ? 'warning' : 'success'} />
        <View style={styles.quantityRow}><Text style={styles.termLabel}>Order quantity</Text><View style={styles.quantityControls}><Pressable onPress={() => setQuantity((value) => Math.max(minimum, value - 1))} style={styles.quantityButton}><Text style={styles.quantityText}>−</Text></Pressable><Text style={styles.quantityValue}>{quantity}</Text><Pressable onPress={() => setQuantity((value) => value + 1)} style={styles.quantityButton}><Text style={styles.quantityText}>+</Text></Pressable></View></View>
        <View style={styles.totalRow}><Text style={styles.termLabel}>Estimated subtotal</Text><Text style={styles.total}>{formatMoney(total)}</Text></View>
        <PortalButton label="Add to bulk cart" onPress={() => addToCart(product, quantity)} />
        <PortalButton label="Open bulk cart" secondary onPress={() => router.push('/business/cart' as never)} />
      </PortalCard>
    </View>
    <PortalCard title="Product specifications"><View style={styles.specList}>{Object.entries(product.specifications ?? {}).map(([key, value]) => <View key={key} style={styles.specRow}><Text style={styles.termLabel}>{key}</Text><Text style={styles.termValue}>{String(value)}</Text></View>)}</View></PortalCard>
  </PortalShell>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  productInfo: { gap: 5 },
  brand: { color: colors.teal, fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  name: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  priceBlock: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  price: { color: colors.cream, fontSize: 28, fontWeight: '900' },
  priceLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  termLabel: { color: colors.muted, fontSize: 12 },
  termValue: { color: colors.cream, fontSize: 12, fontWeight: '900', textAlign: 'right' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityButton: { width: 34, height: 34, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSunken },
  quantityText: { color: colors.cream, fontSize: 20, lineHeight: 22 },
  quantityValue: { minWidth: 28, color: colors.cream, textAlign: 'center', fontSize: 15, fontWeight: '900' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line },
  total: { color: colors.cream, fontSize: 18, fontWeight: '900' },
  specList: { gap: 12 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
