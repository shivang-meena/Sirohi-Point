import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { useRouter } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/state/auth-context';
import { getRoleHomePath } from '@/lib/role-navigation';
import { useThemedStyles } from '@/theme/theme-context';

export function AuthPanel({ mode }: { mode: 'login' | 'signup' | 'admin' | 'business' | 'technician' }) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { login, register, logout, busy } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const signup = mode === 'signup';
  const admin = mode === 'admin';
  const business = mode === 'business';
  const technician = mode === 'technician';

  async function submit() {
    setError(null);
    if (signup && customerLocation.trim().length < 2) {
      setError('Location: enter your city or area.');
      return;
    }
    try {
      const user = signup
        ? await register({
          name: name.trim(),
          email: email.trim(),
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          customerLocation: customerLocation.trim(),
        })
        : await login({ email: email.trim(), password });

      if (admin && user.role !== 'ADMIN') {
        await logout();
        setError('This account does not have administrator access.');
        return;
      }
      if (business && user.role !== 'BUSINESS') {
        await logout();
        setError('This account does not have business buying access.');
        return;
      }
      if (technician && user.role !== 'CONTRACTOR') {
        await logout();
        setError('This account does not have technician access.');
        return;
      }
      if (!signup && !admin && !business && !technician && user.role !== 'CUSTOMER') {
        await logout();
        setError('This account does not have customer shopping access. Use the correct role sign-in page.');
        return;
      }
      router.replace(getRoleHomePath(user.role));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in');
    }
  }

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {signup ? 'Create your customer account' : admin ? 'Admin sign in' : business ? 'Business sign in' : technician ? 'Technician sign in' : 'Customer sign in'}
      </Text>
      <Text style={styles.copy}>
        {signup
          ? 'Use your email, city or area, and a secure password.'
          : admin
            ? 'Authorised Sirohi Point administrators only.'
            : business
              ? 'Access wholesale pricing, bulk orders and business services.'
              : technician
                ? 'Review admin-approved service requests and update job status.'
              : 'Shop products, access orders, and checkout.'}
      </Text>

      {signup ? (
        <>
          <Field label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" styles={styles} />
          <Field label="PHONE (OPTIONAL)" value={phone} onChangeText={setPhone} placeholder="+91" keyboardType="phone-pad" styles={styles} />
          <Field label="CITY OR AREA" value={customerLocation} onChangeText={setCustomerLocation} placeholder="For example, Delhi" styles={styles} />
        </>
      ) : null}
      <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" styles={styles} />
      <Field label="PASSWORD" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" styles={styles} />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void submit()}
        style={({ pressed }) => [styles.submit, pressed && styles.pressed, busy && styles.disabled]}
      >
        {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>{signup ? 'Create account' : 'Sign in'}</Text>}
      </Pressable>

      {!admin ? (
        <Pressable onPress={() => router.replace((signup ? '/customer/login' : business ? '/business/signup' : technician ? '/technician/signup' : '/customer/signup') as never)} style={styles.switchButton}>
          <Text style={styles.switchText}>{signup ? 'Already registered? Sign in' : business ? 'Need a business account? Register' : technician ? 'New technician? Submit a registration request' : 'New customer? Create account'}</Text>
        </Pressable>
      ) : null}
      {!admin ? <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.switchButton}>
        <Text style={styles.switchText}>Choose a different role</Text>
      </Pressable> : null}
    </View>
  );
}

function Field({
  label,
  styles,
  ...props
}: {
  label: string;
  styles: ReturnType<typeof createStyles>;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={styles.placeholder.color}
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  title: { color: colors.cream, fontSize: 28, fontWeight: '900' },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: spacing.xs },
  field: { gap: 6 },
  label: { color: colors.muted, fontSize: 10.5, fontWeight: '900', letterSpacing: 0.6 },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
    color: colors.cream,
    fontSize: 14,
  },
  placeholder: { color: colors.muted },
  error: {
    color: colors.danger,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
  },
  submit: {
    minHeight: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  switchButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  switchText: { color: colors.teal, fontSize: 12.5, fontWeight: '800' },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.62 },
});
