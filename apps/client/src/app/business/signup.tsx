import { useRouter } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import type { ThemeColors } from '@sirohi/design-tokens';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell } from '@/components/portal-ui';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessSignupScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { registerBusiness, busy } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', businessName: '', businessType: '', gstin: '', billingAddress: '', shippingAddress: '' });
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit() {
    setError(null);
    try {
      await registerBusiness({
        name: form.name.trim(), email: form.email.trim(), password: form.password, businessName: form.businessName.trim(), billingAddress: form.billingAddress.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}), ...(form.businessType.trim() ? { businessType: form.businessType.trim() } : {}), ...(form.gstin.trim() ? { gstin: form.gstin.trim() } : {}), ...(form.shippingAddress.trim() ? { shippingAddress: form.shippingAddress.trim() } : {}),
      });
      router.replace('/business/pending' as never);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create business account.'); }
  }
  return <PortalShell eyebrow="BUSINESS ACCOUNT" title="Create your buying account." copy="Add your business identity once, then use wholesale prices and approval-led procurement." actions={<PortalButton label="Back to business portal" secondary onPress={() => router.push('/business' as never)} />}>
    <PortalCard title="Business registration" copy="This form sends your business account for administrator approval before B2B access is enabled.">
      <View style={styles.grid}><Field label="Your name" value={form.name} onChangeText={(value) => set('name', value)} styles={styles} /><Field label="Business name" value={form.businessName} onChangeText={(value) => set('businessName', value)} styles={styles} /><Field label="Email" value={form.email} onChangeText={(value) => set('email', value)} styles={styles} keyboardType="email-address" /><Field label="Password" value={form.password} onChangeText={(value) => set('password', value)} styles={styles} secureTextEntry /><Field label="Phone" value={form.phone} onChangeText={(value) => set('phone', value)} styles={styles} keyboardType="phone-pad" /><Field label="Business type" value={form.businessType} onChangeText={(value) => set('businessType', value)} styles={styles} /><Field label="GSTIN (optional)" value={form.gstin} onChangeText={(value) => set('gstin', value)} styles={styles} /></View>
      <View style={styles.grid}><Field label="Billing address" value={form.billingAddress} onChangeText={(value) => set('billingAddress', value)} styles={styles} multiline /><Field label="Shipping address (optional)" value={form.shippingAddress} onChangeText={(value) => set('shippingAddress', value)} styles={styles} multiline /></View>
      <View style={styles.passwordHint}><Text style={styles.hintTitle}>Business approval</Text><Text style={styles.hintCopy}>After submission, an administrator reviews your details. Approval normally takes up to 48 working hours.</Text></View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable disabled={busy} style={[styles.submit, busy && styles.disabled]} onPress={() => void submit()}>{busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Create business account</Text>}</Pressable>
    </PortalCard>
  </PortalShell>;
}

function Field({ label, styles, ...props }: { label: string; styles: ReturnType<typeof createStyles> } & ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor={styles.placeholder.color} style={[styles.input, props.multiline && styles.multiline]} /></View>; }

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  field: { flexGrow: 1, flexBasis: 240, gap: 6 },
  label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  input: { minHeight: 46, paddingHorizontal: 13, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceSunken, color: colors.cream, fontSize: 13 },
  multiline: { minHeight: 92, paddingVertical: 12, textAlignVertical: 'top' },
  placeholder: { color: colors.muted },
  passwordHint: { padding: 13, borderRadius: 6, backgroundColor: colors.surfaceSunken, gap: 4 },
  hintTitle: { color: colors.cream, fontSize: 12, fontWeight: '900' },
  hintCopy: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  submit: { minHeight: 46, borderRadius: 6, backgroundColor: colors.cta, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  error: { color: colors.danger, backgroundColor: colors.surfaceSunken, borderRadius: 6, padding: 10, fontSize: 12 },
  disabled: { opacity: 0.6 },
});
