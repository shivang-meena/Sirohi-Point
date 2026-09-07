import { formatMoney } from '@sirohi/domain';
import type { ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { CartQuantity } from '@/components/cart-quantity';
import { cartQuantityError } from '@/lib/cart-rules';
import { ProductVisual } from '@/components/product-visual';
import { getB2BProduct, submitOrder } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessCartScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { cart, clearCart, showNotice } = useAppState();
  const { token, user } = useAuth();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const cartIds = Object.keys(cart).sort();
  const catalogQuery = useQuery({ queryKey: ['catalog', 'b2b', 'cart', user?.id, cartIds], queryFn: () => Promise.all(cartIds.map((id) => getB2BProduct(token!, id))), enabled: user?.role === 'BUSINESS' && Boolean(token) });
  const products = catalogQuery.data ?? [];
  const items = useMemo(() => products.filter((product) => (cart[product.id] ?? 0) > 0).map((product) => ({ product, quantity: cart[product.id] ?? 0 })), [cart, products]);
  const total = items.reduce((sum, item) => sum + (item.product.b2bPriceInPaise ?? item.product.priceInPaise) * item.quantity, 0);

  return <PortalShell eyebrow="B2B BULK CART" title={submittedOrderId ? 'Procurement request submitted.' : 'Review your procurement list.'} copy="Minimum quantities and business pricing are visible before the request is sent for admin approval." actions={<PortalButton label="Back to catalogue" secondary onPress={() => router.push('/business/catalog' as never)} />}>
    {submittedOrderId ? <PortalCard title="Waiting for admin approval" copy="Your business order is stored in the backend. An administrator must approve it before fulfilment continues."><View style={styles.confirmation}><Text style={styles.confirmationLabel}>ORDER REFERENCE</Text><Text style={styles.confirmationValue}>{submittedOrderId}</Text></View><PortalButton label="View business orders" onPress={() => router.push('/business/orders' as never)} /><PortalButton label="Shop more products" secondary onPress={() => { setSubmittedOrderId(null); router.push('/business/catalog' as never); }} /></PortalCard> : catalogQuery.isLoading ? <PortalCard title="Loading bulk cart" copy="Refreshing product and pricing data from the backend." /> : catalogQuery.isError ? <PortalCard title="Bulk cart unavailable" copy={catalogQuery.error instanceof Error ? catalogQuery.error.message : 'Unable to load B2B products from the backend.'}><PortalButton label="Clear unavailable items" danger onPress={clearCart} /><PortalButton label="Retry" onPress={() => void catalogQuery.refetch()} /></PortalCard> : !items.length ? <PortalCard title="Your bulk cart is empty" copy="Add products from the B2B catalogue to start a procurement request."><PortalButton label="Browse B2B catalogue" onPress={() => router.push('/business/catalog' as never)} /></PortalCard> : <View style={styles.columns}>
      <PortalCard title={`${items.length} product${items.length === 1 ? '' : 's'} in this request`}><View style={styles.list}>{items.map(({ product, quantity }) => { const unit = product.b2bPriceInPaise ?? product.priceInPaise; const minimum = product.minimumB2BQuantity ?? 1; return <View key={product.id} style={styles.item}><ProductVisual product={product} compact /><View style={styles.itemBody}><Text style={styles.name}>{product.name}</Text><Text style={styles.meta}>{quantity} units · {formatMoney(unit)} per unit</Text><Text style={styles.meta}>MOQ {minimum} · {product.stock} available</Text>{quantity > product.stock ? <StatusBadge label="Backorder quantity will be reviewed" tone="warning" /> : null}</View><View style={styles.itemActions}><Text style={styles.lineTotal}>{formatMoney(unit * quantity)}</Text><CartQuantity product={product} quantity={quantity} business /></View></View>; })}</View><PortalButton label="Clear bulk cart" danger onPress={clearCart} /></PortalCard>
      <PortalCard title="Procurement summary" copy="The backend validates business pricing, minimum quantities, stock, and approval status when this request is submitted."><View style={styles.summaryRow}><Text style={styles.meta}>Products</Text><Text style={styles.summaryValue}>{items.length}</Text></View><View style={styles.summaryRow}><Text style={styles.meta}>Total units</Text><Text style={styles.summaryValue}>{items.reduce((sum, item) => sum + item.quantity, 0)}</Text></View><View style={styles.summaryRow}><Text style={styles.meta}>Estimated subtotal</Text><Text style={styles.total}>{formatMoney(total)}</Text></View><Text style={styles.fieldLabel}>DELIVERY ADDRESS</Text><TextInput value={address} onChangeText={setAddress} multiline placeholder="Enter a complete business delivery address" placeholderTextColor={styles.placeholder.color} style={styles.addressInput} /><Text style={styles.fieldLabel}>PAYMENT METHOD</Text><View style={styles.paymentRow}><Pressable onPress={() => setPaymentMethod('COD')} style={[styles.paymentButton, paymentMethod === 'COD' && styles.paymentActive]}><Text style={[styles.paymentText, paymentMethod === 'COD' && styles.paymentTextActive]}>Pay on delivery</Text></Pressable><Pressable onPress={() => setPaymentMethod('ONLINE')} style={[styles.paymentButton, paymentMethod === 'ONLINE' && styles.paymentActive]}><Text style={[styles.paymentText, paymentMethod === 'ONLINE' && styles.paymentTextActive]}>Pay online</Text></Pressable></View><PortalButton disabled={submitting} label={submitting ? 'Submitting…' : 'Submit for admin approval'} onPress={() => void submitBulkOrder()} /><PortalButton label="View business orders" secondary onPress={() => router.push('/business/orders' as never)} />{submitting ? <ActivityIndicator color={styles.spinner.color} /> : null}</PortalCard>
    </View>}
  </PortalShell>;

  async function submitBulkOrder() {
    if (submitting) return;
    for (const { product, quantity } of items) { const error = cartQuantityError(product, quantity, true); if (error) { showNotice(error); return; } }
    if (!user || !token || user.role !== 'BUSINESS') {
      showNotice('Sign in with a business account before submitting a bulk order.');
      router.push('/' as never);
      return;
    }
    if (address.trim().length < 10) {
      showNotice('Please enter a complete business delivery address.');
      return;
    }
    setSubmitting(true);
    try {
      const summary = await submitOrder(token, { items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })), deliveryAddress: address.trim(), paymentMethod });
      clearCart();
      setSubmittedOrderId(summary.id);
      showNotice(`Bulk order ${summary.id} sent for admin approval.`);
    } catch (reason) {
      showNotice(reason instanceof Error ? reason.message : 'Unable to submit the bulk order.');
    } finally {
      setSubmitting(false);
    }
  }
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  list: { gap: 0 },
  item: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line },
  itemBody: { flex: 1, minWidth: 170, gap: 4 },
  itemActions: { alignItems: 'flex-end', gap: 6 },
  name: { color: colors.cream, fontSize: 14, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 11 },
  lineTotal: { color: colors.cream, fontSize: 14, fontWeight: '900' },
  remove: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  summaryValue: { color: colors.cream, fontSize: 13, fontWeight: '900' },
  total: { color: colors.cream, fontSize: 20, fontWeight: '900' },
  fieldLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  addressInput: { minHeight: 74, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken, color: colors.cream, fontSize: 12, textAlignVertical: 'top' },
  placeholder: { color: colors.muted },
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentButton: { flex: 1, minHeight: 40, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  paymentActive: { borderColor: colors.teal, backgroundColor: colors.tealTint },
  paymentText: { color: colors.muted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  paymentTextActive: { color: colors.teal },
  spinner: { color: colors.teal },
  confirmation: { padding: 14, borderRadius: 6, backgroundColor: colors.surfaceSunken, gap: 4 },
  confirmationLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  confirmationValue: { color: colors.cream, fontSize: 17, fontWeight: '900' },
});
