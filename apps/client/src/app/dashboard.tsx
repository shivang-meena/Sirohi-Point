import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { formatMoney } from '@sirohi/domain';
import type { OrderDetails } from '@sirohi/contracts';
import { useQuery } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { ProductVisual } from '@/components/product-visual';
import { ScreenHeading } from '@/components/screen-heading';
import { SessionLoading } from '@/components/session-loading';
import { getCatalog, getOrders } from '@/lib/api';
import { getRoleHomePath } from '@/lib/role-navigation';
import { useAppState, type CustomerOrder } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useCustomerStyles as useThemedStyles } from '@/theme/customer-theme';

type AccountTab = 'orders' | 'saved' | 'addresses' | 'support';

const tabs: { value: AccountTab; label: string }[] = [
  { value: 'orders', label: 'Your orders' },
  { value: 'saved', label: 'Saved products' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'support', label: 'Help & support' },
];

export default function DashboardScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = tabs.some((item) => item.value === params.tab) ? params.tab as AccountTab : 'orders';
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const { wishlist, cartCount, addToCart, toggleWishlist, showNotice } = useAppState();
  const { user, token, hydrated } = useAuth();
  const otherPortal = user?.role === 'BUSINESS' || user?.role === 'CONTRACTOR' || user?.role === 'ADMIN';
  const desktop = width >= 900;
  const catalog = useQuery({ queryKey: ['catalog'], queryFn: getCatalog });
  const ordersQuery = useQuery({ queryKey: ['orders', user?.id], queryFn: () => getOrders(token!), enabled: hydrated && Boolean(token) && !otherPortal, refetchInterval: 5000 });
  const visibleOrders = ordersQuery.data?.map(toCustomerOrder) ?? [];
  const savedProducts = (catalog.data ?? []).filter((product) => wishlist.includes(product.id));

  if (!hydrated) return <SessionLoading />;
  if (!user) return <Redirect href="/customer" />;
  if (otherPortal) return <Redirect href={getRoleHomePath(user.role)} />;

  return (
    <AppShell>
      <View style={styles.hero}>
        <View style={styles.inner}>
          <View style={[styles.heroTop, desktop && styles.heroTopDesktop]}>
            <ScreenHeading eyebrow="YOUR ACCOUNT" title={`Welcome, ${user.name}`} copy="Manage your orders, saved products and delivery details." />
            <View style={styles.heroActions}>
              <Pressable style={styles.technicianButton} onPress={() => router.push('/services/nearby')}><Text style={styles.technicianButtonText}>Explore technicians →</Text></Pressable>
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <Summary value={String(visibleOrders.length)} label={visibleOrders.length === 1 ? 'order' : 'orders'} styles={styles} />
            <Summary value={String(wishlist.length)} label="saved products" styles={styles} />
            <Summary value={String(cartCount)} label="items in cart" styles={styles} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRail}>
          {tabs.map((item) => (
            <Pressable key={item.value} onPress={() => setTab(item.value)} style={[styles.tabButton, tab === item.value && styles.tabButtonActive]}>
              <Text style={[styles.tabText, tab === item.value && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {tab === 'orders' ? <><OrdersPanel orders={visibleOrders} loading={ordersQuery.isLoading} compact={width < 480} styles={styles} onShop={() => router.push('/catalog')} />{ordersQuery.isError ? <Text style={styles.error}>Unable to load order history from the backend: {ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Unknown error'}</Text> : null}</> : null}

        {tab === 'saved' ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}><View><Text style={styles.panelEyebrow}>SAVED FOR LATER</Text><Text style={styles.panelTitle}>Products you want to revisit</Text></View></View>
            {savedProducts.length ? savedProducts.map((product) => (
              <View key={product.id} style={styles.savedRow}>
                <Pressable onPress={() => router.push(`/product/${product.id}`)}><ProductVisual product={product} compact /></Pressable>
                <Pressable style={styles.savedBody} onPress={() => router.push(`/product/${product.id}`)}>
                  <Text style={styles.savedBrand}>{product.brand}</Text><Text style={styles.savedName}>{product.name}</Text><Text style={styles.savedPrice}>{formatMoney(product.priceInPaise)}</Text>
                </Pressable>
                <View style={styles.savedActions}>
                  <Pressable style={styles.addButton} onPress={() => addToCart(product)}><Text style={styles.addButtonText}>Add to cart</Text></Pressable>
                  <Pressable onPress={() => toggleWishlist(product.id)}><Text style={styles.removeText}>Remove</Text></Pressable>
                </View>
              </View>
            )) : <EmptyState title="No saved products yet" copy="Use the heart button on any product card to keep it here." action="Browse products" onPress={() => router.push('/catalog')} styles={styles} />}
          </View>
        ) : null}

        {tab === 'addresses' ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}><View><Text style={styles.panelEyebrow}>DELIVERY ADDRESSES</Text><Text style={styles.panelTitle}>Where your orders can be delivered</Text></View><Pressable style={styles.outlineButton} onPress={() => showNotice('Address editing will be available during checkout.')}><Text style={styles.outlineButtonText}>+ Add address</Text></Pressable></View>
            <View style={styles.addressCard}><Text style={styles.addressName}>No saved addresses</Text><Text style={styles.addressText}>Delivery addresses are collected during checkout. Address management will appear here when it is backed by the account API.</Text><Pressable onPress={() => router.push('/cart')}><Text style={styles.editLink}>Go to checkout</Text></Pressable></View>
          </View>
        ) : null}

        {tab === 'support' ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}><View><Text style={styles.panelEyebrow}>CUSTOMER SUPPORT</Text><Text style={styles.panelTitle}>How can we help?</Text></View></View>
            <View style={styles.supportGrid}>
              <SupportCard icon="▣" title="Order help" copy="Questions about confirmation, delivery or payment." action="View your orders" onPress={() => setTab('orders')} styles={styles} />
              <SupportCard icon="☎" title="Contact support" copy="Use your account or order details when you contact the Sirohi Point team." action="Open support" onPress={() => showNotice('Support contact details will be provided by the platform.')} styles={styles} />
              <SupportCard icon="⚒" title="Installation support" copy="Book an electrician, painter, plumber or contractor." action="View services" onPress={() => router.push('/services/nearby')} styles={styles} />
            </View>
          </View>
        ) : null}
      </View>
    </AppShell>
  );
}

function toCustomerOrder(order: OrderDetails): CustomerOrder {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    approvalStatus: order.approvalStatus,
    totalInPaise: order.totalInPaise,
    itemCount: order.itemCount,
    deliveryMode: 'standard',
    paymentMethod: order.paymentMethod,
    address: order.deliveryAddress,
    cancellationReason: order.cancellationReason,
    items: order.items.map((item) => ({ productId: item.productId, name: item.productName, quantity: item.quantity, unitPriceInPaise: item.unitPriceInPaise })),
  };
}

function formatOrderStatus(status: CustomerOrder['status']) {
  return status === 'CANCELLED' ? 'Cancelled' : status.replace(/_/g, ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function Summary({ value, label, styles }: { value: string; label: string; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.summaryCard}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function OrdersPanel({ orders, loading, compact, styles, onShop }: { orders: CustomerOrder[]; loading: boolean; compact: boolean; styles: ReturnType<typeof createStyles>; onShop(): void }) {
  if (loading) return <View style={styles.panel}><Text style={styles.loadingText}>Loading order history…</Text></View>;
  if (!orders.length) return <View style={styles.panel}><EmptyState title="You have not placed an order yet" copy="Products you buy will appear here immediately after checkout." action="Start shopping" onPress={onShop} styles={styles} /></View>;
  return (
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <View style={styles.panelHeader}><View><Text style={styles.panelEyebrow}>ORDER HISTORY</Text><Text style={styles.panelTitle}>Your recent orders</Text></View></View>
      {orders.map((order) => (
        <View style={[styles.orderCard, compact && styles.orderCardCompact]} key={order.id}>
          <View style={styles.orderTop}><View style={styles.orderIdentity}><Text style={[styles.orderId, compact && styles.orderIdCompact]} numberOfLines={1} ellipsizeMode="middle">{order.id}</Text><Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</Text></View><View style={[styles.statusPill, order.approvalStatus === 'REJECTED' && styles.statusPillDanger, order.approvalStatus === 'PENDING' && styles.statusPillPending]}><Text numberOfLines={1} style={[styles.statusText, compact && styles.statusTextCompact, order.approvalStatus === 'REJECTED' && styles.statusTextDanger, order.approvalStatus === 'PENDING' && styles.statusTextPending]}>{order.approvalStatus === 'PENDING' ? 'PENDING APPROVAL' : order.approvalStatus === 'REJECTED' ? 'REJECTED' : formatOrderStatus(order.status)}</Text></View></View>
          <View style={styles.orderItems}>{order.items.map((item) => <Text style={styles.orderItem} numberOfLines={compact ? 2 : undefined} key={item.productId}>{item.quantity} × {item.name}</Text>)}</View>
          <View style={styles.orderBottom}><View style={styles.orderDetails}><Text style={styles.orderMeta}>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {order.deliveryMode === 'express' ? 'Express delivery' : 'Standard delivery'}</Text><Text style={styles.orderAddress} numberOfLines={1}>{order.address}</Text></View><Text style={styles.orderTotal}>{formatMoney(order.totalInPaise)}</Text></View>
          <Text style={styles.approvalText}>{order.approvalStatus === 'PENDING' ? 'Waiting for admin approval' : order.approvalStatus === 'REJECTED' ? 'Admin rejected this order' : `Fulfilment status: ${formatOrderStatus(order.status)}`}</Text>{order.cancellationReason ? <Text style={styles.approvalText}>Cancellation reason: {order.cancellationReason}</Text> : null}<View style={[styles.orderProgress, compact && styles.orderProgressCompact]}><ProgressStep label="Submitted" active compact={compact} /><View style={styles.progressLine} /><ProgressStep label="Packed" active={order.status === 'PACKED' || order.status === 'DISPATCHED' || order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'} compact={compact} /><View style={styles.progressLine} /><ProgressStep label="Dispatched" active={order.status === 'DISPATCHED' || order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'} compact={compact} /><View style={styles.progressLine} /><ProgressStep label="Out for delivery" active={order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'} compact={compact} /><View style={styles.progressLine} /><ProgressStep label="Delivered" active={order.status === 'DELIVERED'} compact={compact} /></View>
        </View>
      ))}
    </View>
  );
}

// function ProgressStep({ label, active }: { label: string; active: boolean }) {
//   const styles = useThemedStyles(createStyles);
//   return <View style={styles.progressStep}><View style={[styles.progressDot, active && styles.progressDotActive]} /> <Text style={[styles.progressLabel, active && styles.progressLabelActive]}>{label}</Text></View>;
// }
function ProgressStep({ label, active, compact }: { label: string; active: boolean; compact: boolean }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.progressStep}>
      <View style={[styles.progressDot, active && styles.progressDotActive]} />
      <Text numberOfLines={compact ? 2 : undefined} style={[styles.progressLabel, compact && styles.progressLabelCompact, active && styles.progressLabelActive]}>{label}</Text>
    </View>
  );
}

function EmptyState({ title, copy, action, onPress, styles }: { title: string; copy: string; action: string; onPress(): void; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Text style={styles.emptyIconText}>SP</Text></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyCopy}>{copy}</Text><Pressable style={styles.shopButton} onPress={onPress}><Text style={styles.shopButtonText}>{action}  →</Text></Pressable></View>;
}

function SupportCard({ icon, title, copy, action, onPress, styles }: { icon: string; title: string; copy: string; action: string; onPress(): void; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.supportCard}><View style={styles.supportIcon}><Text style={styles.supportIconText}>{icon}</Text></View><Text style={styles.supportTitle}>{title}</Text><Text style={styles.supportCopy}>{copy}</Text><Pressable onPress={onPress}><Text style={styles.supportAction}>{action}  →</Text></Pressable></View>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  hero: { paddingHorizontal: spacing.lg, paddingVertical: spacing.section, backgroundColor: colors.surfaceSunken, borderBottomWidth: 1, borderBottomColor: colors.line },
  inner: { width: '100%', maxWidth: 1240, alignSelf: 'center', gap: spacing.xl },
  heroTop: { gap: spacing.xl },
  heroTopDesktop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  loading: { minHeight: 420, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.muted, fontSize: 13 },
  shopButton: { minHeight: 48, paddingHorizontal: spacing.xl, borderRadius: radius.md, backgroundColor: colors.copper, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  shopButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  technicianButton: { minHeight: 48, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  technicianButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  summaryCard: { flexGrow: 1, flexBasis: 180, minHeight: 92, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  summaryValue: { color: colors.brass, fontSize: 28, fontWeight: '900' },
  summaryLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', marginTop: 4 },
  content: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl, gap: spacing.xl },
  tabRail: { gap: spacing.sm },
  tabButton: { minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { borderColor: colors.teal, backgroundColor: colors.tealTint },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  tabTextActive: { color: colors.teal },
  panel: { padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: spacing.lg },
  panelCompact: { padding: spacing.md, gap: spacing.md },
  panelHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  panelEyebrow: { color: colors.teal, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  panelTitle: { color: colors.cream, fontSize: 23, fontWeight: '900', marginTop: 4 },
  orderCard: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken },
  orderCardCompact: { padding: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  orderIdentity: { flex: 1, minWidth: 0 },
  orderId: { color: colors.cream, fontSize: 17, fontWeight: '900', flexShrink: 1 },
  orderIdCompact: { fontSize: 15 },
  orderDate: { color: colors.muted, fontSize: 11, marginTop: 3 },
  statusPill: { alignSelf: 'flex-start', flexShrink: 1, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.successTint },
  statusText: { color: colors.success, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  statusTextCompact: { fontSize: 8, letterSpacing: 0.35 },
  statusPillPending: { backgroundColor: colors.copperTint },
  statusPillDanger: { backgroundColor: colors.surfaceSunken },
  statusTextPending: { color: colors.copper },
  statusTextDanger: { color: colors.danger },
  approvalText: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: spacing.md },
  error: { color: colors.copper, fontSize: 11, fontWeight: '800' },
  orderItems: { gap: 4, marginTop: spacing.md },
  orderItem: { color: colors.cream, fontSize: 13, fontWeight: '700' },
  orderBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, paddingTop: spacing.md, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
  orderDetails: { flex: 1, minWidth: 0 },
  orderMeta: { color: colors.muted, fontSize: 11 },
  orderAddress: { color: colors.muted, fontSize: 10, maxWidth: 520, marginTop: 3 },
  orderTotal: { color: colors.brass, fontSize: 19, fontWeight: '900' },
  orderProgress: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg },
  orderProgressCompact: { marginTop: spacing.md },
  progressStep: { flex: 1, minWidth: 0, alignItems: 'center' },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.track, borderWidth: 2, borderColor: colors.surfaceSunken },
  progressDotActive: { backgroundColor: colors.success },
  progressLabel: { color: colors.muted, fontSize: 8, marginTop: 5, textAlign: 'center', lineHeight: 10 },
  progressLabelCompact: { fontSize: 7, lineHeight: 9 },
  progressLabelActive: { color: colors.cream, fontWeight: '800' },
  progressLine: { flexGrow: 0, flexShrink: 0, width: 10, height: 2, backgroundColor: colors.track, marginTop: 5 },
  savedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  savedBody: { flex: 1, minWidth: 160 },
  savedBrand: { color: colors.teal, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  savedName: { color: colors.cream, fontSize: 16, fontWeight: '900', marginTop: 3 },
  savedPrice: { color: colors.brass, fontSize: 15, fontWeight: '900', marginTop: 6 },
  savedActions: { alignItems: 'center', gap: spacing.sm },
  addButton: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.copper, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  removeText: { color: colors.danger, fontSize: 11, fontWeight: '900' },
  outlineButton: { minHeight: 42, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  outlineButtonText: { color: colors.cream, fontSize: 11, fontWeight: '900' },
  addressCard: { maxWidth: 620, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken },
  addressTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  addressLabel: { color: colors.muted, fontSize: 10, fontWeight: '900' },
  defaultPill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.tealTint },
  defaultPillText: { color: colors.teal, fontSize: 8, fontWeight: '900' },
  addressName: { color: colors.cream, fontSize: 17, fontWeight: '900', marginTop: spacing.md },
  addressText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
  addressPhone: { color: colors.muted, fontSize: 12, marginTop: spacing.sm },
  editLink: { color: colors.teal, fontSize: 12, fontWeight: '900', marginTop: spacing.lg },
  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  supportCard: { minWidth: 0, flexGrow: 1, flexBasis: 260, minHeight: 210, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken },
  supportIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.tealTint, alignItems: 'center', justifyContent: 'center' },
  supportIconText: { color: colors.teal, fontSize: 18 },
  supportTitle: { color: colors.cream, fontSize: 17, fontWeight: '900', marginTop: spacing.md },
  supportCopy: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: spacing.sm },
  supportAction: { color: colors.teal, fontSize: 11, fontWeight: '900', marginTop: spacing.lg },
  empty: { minHeight: 320, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.tealTint, alignItems: 'center', justifyContent: 'center' },
  emptyIconText: { color: colors.teal, fontSize: 16, fontWeight: '900' },
  emptyTitle: { color: colors.cream, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, maxWidth: 460, textAlign: 'center' },
});

