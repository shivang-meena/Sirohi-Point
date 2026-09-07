import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { calculateCartTotal, formatMoney } from '@sirohi/domain';
import { useQuery } from '@tanstack/react-query';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { CartQuantity } from '@/components/cart-quantity';
import { ProductVisual } from '@/components/product-visual';
import { getB2CProduct, submitOrder } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useCustomerStyles as useThemedStyles } from '@/theme/customer-theme';

type DeliveryMode = 'standard' | 'express';
type PaymentMethod = 'COD' | 'ONLINE';

export default function CartScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const { cart, clearCart, placeOrder, showNotice } = useAppState();
  const { user, token } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [address, setAddress] = useState('');
  const desktop = width >= 920;
  const cartIds = Object.keys(cart).sort();
  const catalog = useQuery({ queryKey: ['catalog', 'b2c', 'cart', user?.id, cartIds], queryFn: () => Promise.all(cartIds.map(getB2CProduct)) });
  const products = catalog.data ?? [];
  const compactLine = width < 620;
  const lines = useMemo(
    () => products
      .filter((product) => (cart[product.id] ?? 0) > 0)
      .map((product) => ({ product, quantity: cart[product.id] })),
    [cart, products],
  );
  const subtotal = calculateCartTotal(lines);
  const baseDelivery = 0;
  const delivery = 0;
  const total = subtotal + delivery;
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  async function confirmOrder() {
    if (submitting) return;
    if (user?.role !== 'CUSTOMER' || !token) {
      showNotice('Sign in before placing your order.');
      router.replace('/customer/login' as never);
      return;
    }
    if (address.trim().length < 10) {
      showNotice('Please enter a complete delivery address.');
      return;
    }
    setSubmitting(true);
    try {
      const summary = await submitOrder(token, {
        deliveryAddress: address.trim(),
        paymentMethod,
        items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      const order = placeOrder({
        totalInPaise: summary.totalInPaise,
        itemCount,
        deliveryMode,
        paymentMethod,
        address: address.trim(),
        items: lines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          quantity,
          unitPriceInPaise: product.priceInPaise,
        })),
      }, summary.id);
      setOrderId(order.id);
      setOrdered(true);
    } catch (reason) {
      showNotice(reason instanceof Error ? reason.message : 'Unable to place the order');
    } finally {
      setSubmitting(false);
    }
  }

  if (user?.role === 'BUSINESS') return <Redirect href="/business/cart" />;
  return (
    <AppShell>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>{ordered ? 'Order submitted' : `Shopping cart${itemCount ? ` (${itemCount} item${itemCount === 1 ? '' : 's'})` : ''}`}</Text>

        {!lines.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{ordered ? 'Your order is awaiting admin approval.' : catalog.isLoading ? 'Loading your cart…' : catalog.isError ? 'Cart products are unavailable.' : 'Your cart is empty.'}</Text>
            <Text style={styles.emptyCopy}>
              {ordered
                ? 'Your order now appears in the account panel, where you can review its products, total and status.'
                : catalog.isError
                  ? 'The cart uses the current product catalogue from the backend. Check the API connection and try again.'
                : 'Add products from the store, then review quantities, delivery and payment here.'}
            </Text>
            {ordered ? (
              <View style={styles.confirmationCard}>
                <ConfirmationItem label="Order ID" value={orderId ?? 'Confirmed'} />
                <ConfirmationItem label="Delivery" value={deliveryMode === 'express' ? 'Express' : 'Standard'} />
                <ConfirmationItem label="Payment" value={paymentMethod === 'COD' ? 'Pay on delivery' : 'Online'} />
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => router.push(ordered ? '/dashboard' : '/catalog')}
            >
              <Text style={styles.primaryText}>{ordered ? 'Track your order' : 'Continue shopping'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.columns, desktop && styles.columnsDesktop]}>
            <View style={styles.lineList}>
              <View style={styles.listHeader}>
                <Text style={styles.listCopy}>Quantities can be changed before you place the order</Text>
                <Pressable onPress={clearCart} style={styles.clearButton}><Text style={styles.clearText}>Clear cart</Text></Pressable>
              </View>

              {lines.map(({ product, quantity }) => (
                <View key={product.id} style={[styles.line, compactLine && styles.lineCompact]}>
                  <ProductVisual product={product} compact />
                  <View style={styles.lineBody}>
                    <Text style={styles.lineBrand}>{product.brand}</Text>
                    <Text style={styles.lineName}>{product.name}</Text>
                    <View style={styles.lineStatus}>
                      <View style={styles.stockDot} />
                      <Text style={styles.lineMeta}>{product.stock} in stock</Text>
                      <Text style={styles.lineMeta}>·</Text>
                      <Text style={styles.lineMeta}>{product.serviceAvailable ? 'Installation available' : 'Material only'}</Text>
                    </View>
<CartQuantity product={product} quantity={quantity} />
                  </View>
                  <Text style={styles.linePrice}>{formatMoney(product.priceInPaise * quantity)}</Text>
                </View>
              ))}

              <View style={styles.fulfilmentCard}>
                <Text style={styles.panelTitle}>Delivery options</Text>
                <View style={styles.optionGrid}>
                  <OptionCard
                    title="Standard delivery"
                    copy="Timing confirmed for your address"
                    price={baseDelivery ? formatMoney(baseDelivery) : 'Free'}
                    selected={deliveryMode === 'standard'}
                    onPress={() => setDeliveryMode('standard')}
                  />

                </View>
                <Text style={styles.fieldLabel}>DELIVERY ADDRESS</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  accessibilityLabel="Delivery address"
                  placeholder="Enter a complete site address"
                  placeholderTextColor={styles.inputPlaceholder.color}
                  multiline
                  style={styles.addressInput}
                />
              </View>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Price details</Text>
              <SummaryRow label={`Subtotal (${itemCount} item${itemCount === 1 ? '' : 's'})`} value={formatMoney(subtotal)} />
              <SummaryRow label={deliveryMode === 'express' ? 'Express delivery' : 'Delivery charges'} value={delivery ? formatMoney(delivery) : 'Free'} />

              <View style={styles.totalRow}><Text style={styles.totalLabel}>Total amount</Text><Text style={styles.totalValue}>{formatMoney(total)}</Text></View>
              <Text style={styles.savingsNote}>Delivery timing is confirmed by admin. No delivery fee is included in this order.</Text>

              <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
              <View style={styles.paymentRow}>
                <Pressable onPress={() => setPaymentMethod('COD')} style={[styles.paymentButton, paymentMethod === 'COD' && styles.paymentActive]}>
                  <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.paymentTextActive]}>Pay on delivery</Text>
                </Pressable>
                <Pressable disabled accessibilityState={{ disabled: true }} style={[styles.paymentButton, paymentMethod === 'ONLINE' && styles.paymentActive]}>
                  <Text style={[styles.paymentText, paymentMethod === 'ONLINE' && styles.paymentTextActive]}>Online payment unavailable</Text>
                </Pressable>
              </View>
              <Pressable accessibilityRole="button" disabled={submitting} style={[styles.primaryButton, submitting && styles.disabled]} onPress={() => void confirmOrder()}>
                {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Place order</Text>}
              </Pressable>
              <Text style={styles.secureNote}>GST invoice · Verified fulfilment · Support included</Text>
            </View>
          </View>
        )}
      </View>
    </AppShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

function ConfirmationItem({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.confirmationItem}><Text style={styles.confirmationLabel}>{label}</Text><Text style={styles.confirmationValue}>{value}</Text></View>;
}

function OptionCard({ title, copy, price, selected, onPress }: { title: string; copy: string; price: string; selected: boolean; onPress(): void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.optionCard, selected && styles.optionCardActive]}>
      <View style={[styles.radio, selected && styles.radioActive]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionCopy}>{copy}</Text>
      <Text style={styles.optionPrice}>{price}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { width: '100%', maxWidth: 1500, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.md },
  pageTitle: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  columns: { gap: spacing.md },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  lineList: { flex: 1.4, gap: spacing.sm },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingBottom: spacing.xs },
  listCopy: { color: colors.muted, fontSize: 12.5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, backgroundColor: colors.surface },
  lineCompact: { flexWrap: 'wrap' },
  lineBody: { flex: 1, minWidth: 150, gap: 4 },
  lineBrand: { color: colors.teal, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' },
  lineName: { color: colors.cream, fontSize: 14.5, fontWeight: '700' },
  lineStatus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  lineMeta: { color: colors.muted, fontSize: 11 },
  linePrice: { color: colors.cream, fontSize: 15, fontWeight: '900' },
  stepper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 2, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.surfaceSunken },
  stepButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  stepText: { color: colors.cream, fontSize: 16, fontWeight: '700' },
  quantity: { color: colors.cream, width: 30, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  clearButton: { paddingVertical: spacing.xs },
  clearText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  fulfilmentCard: { marginTop: spacing.xs, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: spacing.sm },
  panelTitle: { color: colors.cream, fontSize: 16, fontWeight: '900' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionCard: { flexGrow: 1, flexBasis: 200, minHeight: 108, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken },
  optionCardActive: { borderColor: colors.teal, backgroundColor: colors.tealTint },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.teal },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.teal },
  optionTitle: { color: colors.cream, fontSize: 13.5, fontWeight: '800', marginTop: spacing.sm },
  optionCopy: { color: colors.muted, fontSize: 11.5, marginTop: 3 },
  optionPrice: { color: colors.cream, fontSize: 13, fontWeight: '900', marginTop: 'auto', paddingTop: spacing.sm },
  fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginTop: spacing.xs },
  addressInput: { minHeight: 72, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken, color: colors.cream, fontSize: 13.5, textAlignVertical: 'top' },
  inputPlaceholder: { color: colors.muted },
  summary: { flex: 0.65, minWidth: 0, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface },
  summaryTitle: { color: colors.cream, fontSize: 16, fontWeight: '900', marginBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  summaryValue: { color: colors.cream, fontSize: 13, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.sm, marginTop: 2 },
  totalLabel: { color: colors.cream, fontSize: 14, fontWeight: '900' },
  totalValue: { color: colors.cream, fontSize: 21, fontWeight: '900' },
  savingsNote: { color: colors.success, fontSize: 12, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', gap: spacing.sm },
  paymentButton: { flex: 1, minHeight: 40, paddingHorizontal: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken, alignItems: 'center', justifyContent: 'center' },
  paymentActive: { borderColor: colors.teal, backgroundColor: colors.tealTint },
  paymentText: { color: colors.muted, fontSize: 11.5, fontWeight: '800', textAlign: 'center' },
  paymentTextActive: { color: colors.teal },
  primaryButton: { minHeight: 46, paddingHorizontal: spacing.xl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cta, marginTop: spacing.xs },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  secureNote: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  disabled: { opacity: 0.62 },
  empty: { minHeight: 340, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { color: colors.cream, fontSize: 19, fontWeight: '900', textAlign: 'center' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, maxWidth: 460, textAlign: 'center' },
  confirmationCard: { width: '100%', maxWidth: 480, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.surfaceSunken },
  confirmationItem: { flexGrow: 1, minWidth: 120, alignItems: 'center' },
  confirmationLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  confirmationValue: { color: colors.cream, fontSize: 13, fontWeight: '900', marginTop: 3 },
});

