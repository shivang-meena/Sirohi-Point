import { formatMoney } from '@sirohi/domain';
import type { ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PortalButton, PortalCard, PortalMetric, PortalShell, StatusBadge } from '@/components/portal-ui';
import { getOrders } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessHomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { cartCount } = useAppState();
  const { token, user } = useAuth();
  const ordersQuery = useQuery({ queryKey: ['orders', user?.id], queryFn: () => getOrders(token!), enabled: user?.role === 'BUSINESS' && Boolean(token), refetchInterval: 5000 });
  const recentOrders = ordersQuery.data?.slice(0, 3).map((order) => ({ id: order.id, summary: order.items.map((item) => `${item.quantity} × ${item.productName}`).join(' · '), itemCount: order.itemCount, totalInPaise: order.totalInPaise, approvalStatus: order.approvalStatus ?? 'PENDING', status: order.status })) ?? [];

  return (
    <PortalShell
      eyebrow="BUSINESS PROCUREMENT"
      title="Buy better for every site and store."
      copy="A dedicated B2B workspace for wholesale pricing, minimum quantities, stock visibility, and approval-led ordering."
      actions={<><PortalButton label="Browse bulk catalogue" onPress={() => router.push('/business/catalog' as never)} /><PortalButton label={`Bulk cart${cartCount ? ` (${cartCount})` : ''}`} secondary onPress={() => router.push('/business/cart' as never)} /><PortalButton label="My profile" secondary onPress={() => router.push('/business/profile' as never)} /></>}
    >
      <View style={styles.metrics}>
        <PortalMetric value="B2B" label="Business price list" />
        <PortalMetric value="MOQ" label="Minimum quantity shown" />
        <PortalMetric value="GST" label="Invoice-ready orders" />
        <PortalMetric value="Admin" label="Approval before fulfilment" />
      </View>

      <View style={styles.grid}>
        <PortalCard title="Start a bulk order" copy="Select products, review the wholesale rate, and add quantities that meet each product's MOQ.">
          <View style={styles.actionStack}>
            <PortalButton label="Open B2B catalogue" onPress={() => router.push('/business/catalog' as never)} />
            <PortalButton label="View bulk cart" secondary onPress={() => router.push('/business/cart' as never)} />
          </View>
        </PortalCard>
        <PortalCard title="Your buying workspace" copy="Track approval, packing, dispatch, and delivery from one business order timeline.">
          <View style={styles.actionStack}>
            <PortalButton label="View B2B orders" onPress={() => router.push('/business/orders' as never)} />
            <PortalButton label="My profile" secondary onPress={() => router.push('/business/profile' as never)} />
            <Text style={styles.orderMeta}>Signed in as {user?.name}</Text>
          </View>
        </PortalCard>
      </View>

      <PortalCard title="Recent business orders" copy="Orders are loaded from your business account after sign in.">
        {ordersQuery.isLoading ? <Text style={styles.orderMeta}>Loading orders from the backend…</Text> : null}
        {ordersQuery.isError ? <Text style={styles.error}>Unable to load business orders: {ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Unknown error'}</Text> : null}
        {!ordersQuery.isLoading && !ordersQuery.isError && !recentOrders.length ? <Text style={styles.orderMeta}>No business orders have been placed yet.</Text> : null}
        {recentOrders.map((order) => (
          <Pressable key={order.id} onPress={() => router.push('/business/orders' as never)} style={styles.orderRow}>
            <View style={styles.orderBody}><Text style={styles.orderId}>{order.id}</Text><Text style={styles.orderSummary}>{order.summary}</Text><Text style={styles.orderMeta}>{order.itemCount} items · {formatMoney(order.totalInPaise)}</Text><Text style={styles.orderMeta}>Fulfilment: {order.status}</Text></View>
            <View style={styles.orderBadges}><StatusBadge label={order.approvalStatus === 'APPROVED' ? 'Approved' : order.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending approval'} tone={order.approvalStatus === 'APPROVED' ? 'success' : order.approvalStatus === 'REJECTED' ? 'danger' : 'warning'} /><StatusBadge label={order.status} tone={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'} /></View>
          </Pressable>
        ))}
      </PortalCard>

      <View style={styles.note}><Text style={styles.noteTitle}>Connected flow</Text><Text style={styles.noteCopy}>Business products and orders use the authenticated B2B endpoints. Admin approval is reflected in the same order record.</Text></View>
    </PortalShell>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionStack: { gap: 10, alignItems: 'flex-start' },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line },
  orderBody: { flex: 1, minWidth: 180 },
  orderBadges: { alignItems: 'flex-end', gap: 6 },
  orderId: { color: colors.cream, fontSize: 14, fontWeight: '900' },
  orderSummary: { color: colors.muted, fontSize: 12, marginTop: 4 },
  orderMeta: { color: colors.muted, fontSize: 11, marginTop: 6 },
  note: { padding: 16, borderRadius: 8, backgroundColor: colors.tealTint, borderWidth: 1, borderColor: colors.teal, gap: 4 },
  noteTitle: { color: colors.teal, fontSize: 12, fontWeight: '900' },
  noteCopy: { color: colors.cream, fontSize: 12, lineHeight: 18 },
  error: { color: colors.copper, fontSize: 11, fontWeight: '800', marginBottom: 8 },
});
