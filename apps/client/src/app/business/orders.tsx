import { formatMoney } from '@sirohi/domain';
import type { OrderDetails } from '@sirohi/contracts';
import type { ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { getOrders } from '@/lib/api';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessOrdersScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { token, user } = useAuth();
  const ordersQuery = useQuery({ queryKey: ['orders', user?.id], queryFn: () => getOrders(token!), enabled: user?.role === 'BUSINESS' && Boolean(token), refetchInterval: 5000 });
  const orders = ordersQuery.data?.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    approvalStatus: order.approvalStatus ?? 'PENDING',
    itemCount: order.itemCount,
    totalInPaise: order.totalInPaise,
    cancellationReason: order.cancellationReason,
    summary: order.items.map((item) => `${item.quantity} × ${item.productName}`).join(' · '),
  })) ?? [];
  return <PortalShell eyebrow="B2B ORDER HISTORY" title="Procurement, approval, and fulfilment." copy="Business orders move through admin approval before the fulfilment status changes. This page refreshes automatically." actions={<View style={styles.actions}><PortalButton label="Shop bulk products" onPress={() => router.push('/business/catalog' as never)} /><PortalButton label="View my orders" secondary onPress={() => router.replace('/business/orders' as never)} /></View>}>
    {ordersQuery.isLoading ? <Text style={styles.meta}>Loading order history from the backend…</Text> : null}
    {ordersQuery.isError ? <Text style={styles.error}>Unable to load business order history: {ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Unknown error'}</Text> : null}
    {!ordersQuery.isLoading && !ordersQuery.isError && !orders.length ? <PortalCard title="No business orders yet" copy="Orders submitted from the B2B cart will appear here after they are saved by the backend." /> : null}
    <View style={styles.list}>{orders.map((order) => <PortalCard key={order.id}><View style={styles.top}><View><Text style={styles.id}>{order.id}</Text><Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</Text></View><View style={styles.badges}><StatusBadge label={order.approvalStatus === 'APPROVED' ? 'Approved' : order.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending approval'} tone={order.approvalStatus === 'APPROVED' ? 'success' : order.approvalStatus === 'REJECTED' ? 'danger' : 'warning'} /><StatusBadge label={formatOrderStatus(order.status)} tone={order.status === 'CANCELLED' ? 'danger' : order.status === 'DELIVERED' ? 'success' : 'warning'} /></View></View><Text style={styles.summary}>{order.summary}</Text><View style={styles.bottom}><Text style={styles.meta}>{order.itemCount} units · Current status: {formatOrderStatus(order.status)}</Text><Text style={styles.total}>{formatMoney(order.totalInPaise)}</Text></View>{order.cancellationReason ? <Text style={styles.error}>Cancellation reason: {order.cancellationReason}</Text> : null}<OrderStatusTimeline status={order.status} /></PortalCard>)}</View>
  </PortalShell>;
}

const statusSteps: OrderDetails['status'][] = ['CONFIRMED', 'ACCEPTED', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
function formatOrderStatus(status: OrderDetails['status']) { return status === 'CONFIRMED' ? 'Submitted' : status === 'ACCEPTED' ? 'Approved' : status.replace(/_/g, ' ').toLowerCase().replace(/^./, (letter) => letter.toUpperCase()); }
function OrderStatusTimeline({ status }: { status: OrderDetails['status'] }) { const styles = useThemedStyles(createStyles); if (status === 'CANCELLED') return <View style={styles.cancelled}><StatusBadge label="Order cancelled" tone="danger" /></View>; const activeIndex = statusSteps.indexOf(status); return <View style={styles.timeline}>{statusSteps.map((step, index) => <View key={step} style={styles.step}><View style={[styles.dot, index <= activeIndex && styles.dotActive]} /><Text style={[styles.stepText, index <= activeIndex && styles.stepTextActive]}>{formatOrderStatus(step)}</Text></View>)}</View>; }

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  timeline: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, padding: 16, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.track },
  dotActive: { backgroundColor: colors.teal },
  stepText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  stepTextActive: { color: colors.cream },
  list: { gap: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  id: { color: colors.cream, fontSize: 15, fontWeight: '900' },
  date: { color: colors.muted, fontSize: 11, marginTop: 4 },
  summary: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: colors.muted, fontSize: 11 },
  total: { color: colors.cream, fontSize: 17, fontWeight: '900' },
  badges: { alignItems: 'flex-end', gap: 6 },
  cancelled: { paddingTop: 8 },
  note: { padding: 16, backgroundColor: colors.tealTint, borderColor: colors.teal, borderWidth: 1, borderRadius: 8, gap: 4 },
  noteTitle: { color: colors.teal, fontWeight: '900', fontSize: 12 },
  noteCopy: { color: colors.cream, fontSize: 12, lineHeight: 18 },
  error: { color: colors.copper, fontSize: 11, fontWeight: '800' },
});
