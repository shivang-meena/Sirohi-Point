import type { ServiceOffer, ServiceOfferInput } from '@sirohi/contracts';
import { formatMoney } from '@sirohi/domain';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { getAdminContractors, getAdminProducts, getAdminServiceOffers, saveAdminServiceOffer } from '@/lib/api';
import { useAppTheme } from '@/theme/theme-context';
import { PortalButton, PortalCard } from './portal-ui';

const empty = { title: '', description: '', discount: '', serviceType: '', contractorId: '', productId: '', active: true };
export function ServiceOffersEditor({ token }: { token: string }) {
  const client = useQueryClient();
  const { colors } = useAppTheme();
  const [form, setForm] = useState(empty);
  const [id, setId] = useState<string>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const offers = useQuery({ queryKey: ['admin', 'service-offers'], queryFn: () => getAdminServiceOffers(token) });
  const products = useQuery({ queryKey: ['admin', 'products'], queryFn: () => getAdminProducts(token) });
  const contractors = useQuery({ queryKey: ['admin', 'contractors'], queryFn: () => getAdminContractors(token) });
  function edit(offer: ServiceOffer) { setId(offer.id); setForm({ title: offer.title, description: offer.description, discount: String(offer.discountInPaise / 100), serviceType: offer.serviceType ?? '', contractorId: offer.contractorId ?? '', productId: offer.productId ?? '', active: offer.active }); }
  async function save() {
    if (busy) return;
    const input: ServiceOfferInput = { title: form.title.trim(), description: form.description.trim(), discountInPaise: Math.round(Number(form.discount) * 100), serviceType: form.serviceType.trim() || null, productId: form.productId || null, contractorId: form.contractorId || null, active: form.active };
    if (!Number.isFinite(input.discountInPaise) || input.discountInPaise <= 0) { setMessage('Discount must be a positive amount in rupees.'); return; }
    setBusy(true); setMessage('');
    try { await saveAdminServiceOffer(token, input, id); await Promise.all([client.invalidateQueries({ queryKey: ['admin', 'service-offers'] }), client.invalidateQueries({ queryKey: ['service-offers'] })]); setId(undefined); setForm(empty); setMessage('Service offer saved.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save offer'); }
    finally { setBusy(false); }
  }
  const inputStyle = { color: colors.cream, backgroundColor: colors.surfaceSunken, borderColor: colors.line, borderWidth: 1, padding: 12, minHeight: 44 };
  return <View style={{ gap: 18 }}><PortalCard title={id ? 'Edit service offer' : 'New service offer'} copy="Discounts apply to the listed visit charge, capped at that charge. Product-linked offers require the customer's delivered order and can be used once per order.">
    {(['title', 'description', 'discount', 'serviceType'] as const).map((key) => { const label = key === 'discount' ? 'Discount (₹)' : key === 'serviceType' ? 'Service type (blank = any)' : key; return <View key={key} style={{ gap: 6 }}><Text style={{ color: colors.muted }}>{label}</Text><TextInput accessibilityLabel={label} value={form[key]} onChangeText={(value) => setForm({ ...form, [key]: value })} style={inputStyle} /></View>; })}
    <Text style={{ color: colors.muted }}>Eligible product purchase (optional)</Text><ScrollView horizontal contentContainerStyle={{ gap: 8 }}><PortalButton label="No purchase required" secondary={Boolean(form.productId)} onPress={() => setForm({ ...form, productId: '' })} />{products.data?.filter((p) => p.active).map((p) => <PortalButton key={p.id} label={p.name} secondary={form.productId !== p.id} onPress={() => setForm({ ...form, productId: p.id })} />)}</ScrollView>
    <Text style={{ color: colors.muted }}>Technician (optional)</Text><ScrollView horizontal contentContainerStyle={{ gap: 8 }}><PortalButton label="Any approved technician" secondary={Boolean(form.contractorId)} onPress={() => setForm({ ...form, contractorId: '' })} />{contractors.data?.filter((p) => p.approvalStatus === 'APPROVED').map((p) => <PortalButton key={p.id} label={p.name} secondary={form.contractorId !== p.id} onPress={() => setForm({ ...form, contractorId: p.id })} />)}</ScrollView>
    <PortalButton label={form.active ? 'Active ✓' : 'Inactive'} secondary={!form.active} onPress={() => setForm({ ...form, active: !form.active })} />
    <PortalButton label={busy ? 'Saving…' : 'Save offer'} disabled={busy} onPress={() => void save()} />{id ? <PortalButton label="Cancel editing" secondary onPress={() => { setId(undefined); setForm(empty); }} /> : null}
    {message ? <Text accessibilityRole="alert" style={{ color: colors.cream }}>{message}</Text> : null}
  </PortalCard>{offers.isLoading ? <PortalCard copy="Loading offers…" /> : offers.isError ? <PortalCard copy="Unable to load offers." /> : offers.data?.map((offer) => <PortalCard key={offer.id} title={offer.title} copy={`${offer.active ? 'Active' : 'Inactive'} · Up to ${formatMoney(offer.discountInPaise)} off the visit charge`}><PortalButton label="Edit offer" secondary onPress={() => edit(offer)} /></PortalCard>)}</View>;
}
