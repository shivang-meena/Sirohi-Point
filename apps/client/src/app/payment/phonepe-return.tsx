import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { verifyPhonePePayment } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useCustomerStyles as useThemedStyles } from '@/theme/customer-theme';

type PaymentViewState = 'loading' | 'success' | 'failed' | 'pending';

export default function PhonePeReturnScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { merchantOrderId } = useLocalSearchParams<{ merchantOrderId?: string }>();
  const { token } = useAuth();
  const { clearCart } = useAppState();
  const [state, setState] = useState<PaymentViewState>('loading');
  const [message, setMessage] = useState('Verifying your PhonePe payment…');
  const verified = useRef(false);

  useEffect(() => {
    let active = true;
    if (verified.current) return () => { active = false; };
    if (!merchantOrderId || !token) {
      setState('failed');
      setMessage('We could not verify this payment because the order session is missing.');
      return () => { active = false; };
    }
    verified.current = true;
    void verifyPhonePePayment(token, merchantOrderId)
      .then((payment) => {
        if (!active) return;
        if (payment.state === 'COMPLETED') {
          clearCart();
          setState('success');
          setMessage('Your PhonePe payment was successful and your order is confirmed.');
        } else if (payment.state === 'FAILED') {
          setState('failed');
          setMessage('PhonePe did not complete the payment. Your cart is still available to try again.');
        } else {
          setState('pending');
          setMessage('PhonePe is still processing this payment. Your cart has not been cleared.');
        }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setState('failed');
        setMessage(reason instanceof Error ? reason.message : 'We could not verify the PhonePe payment.');
      });
    return () => { active = false; };
  }, [clearCart, merchantOrderId, token]);

  return (
    <AppShell>
      <View style={styles.content}>
        <View style={styles.card}>
          {state === 'loading' ? <ActivityIndicator color={styles.spinner.color} size="large" /> : <Text style={[styles.icon, state === 'success' ? styles.success : state === 'pending' ? styles.pending : styles.failed]}>{state === 'success' ? '✓' : state === 'pending' ? '…' : '!'}</Text>}
          <Text style={styles.title}>{state === 'loading' ? 'Checking payment' : state === 'success' ? 'Payment successful' : state === 'pending' ? 'Payment pending' : 'Payment not completed'}</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace(state === 'success' ? '/dashboard' : '/cart')}>
            <Text style={styles.primaryText}>{state === 'success' ? 'View my orders' : 'Return to cart'}</Text>
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.xl, justifyContent: 'center' },
  card: { alignItems: 'center', padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: spacing.md },
  spinner: { color: colors.teal },
  icon: { width: 64, height: 64, borderRadius: 32, textAlign: 'center', lineHeight: 64, fontSize: 32, fontWeight: '900' },
  success: { color: colors.success, backgroundColor: colors.tealTint },
  pending: { color: colors.teal, backgroundColor: colors.surfaceSunken },
  failed: { color: colors.danger, backgroundColor: colors.surfaceSunken },
  title: { color: colors.cream, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  message: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 520 },
  primaryButton: { minHeight: 46, paddingHorizontal: spacing.xl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cta, marginTop: spacing.sm },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
