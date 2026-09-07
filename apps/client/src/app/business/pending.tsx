import type { ThemeColors } from '@sirohi/design-tokens';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessPendingScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <PortalShell
      eyebrow="REGISTRATION RECEIVED"
      title="Your business request is under review."
      copy="Thank you for registering for Sirohi Point bulk buying. An administrator will review your business details before B2B access is enabled."
      actions={<PortalButton label="Back to role selection" secondary onPress={() => router.replace('/' as never)} />}
    >
      <PortalCard title="Please wait for approval" copy="Approval normally takes up to 48 working hours. You cannot sign in to the B2B portal until your request is approved.">
        <View style={styles.statusRow}>
          <StatusBadge label="PENDING ADMIN APPROVAL" tone="warning" />
        </View>
        <Text style={styles.body}>Once approved, return to the business sign-in page and use the email and password from your registration.</Text>
        <PortalButton label="Business sign in" onPress={() => router.replace('/business/login' as never)} />
      </PortalCard>
    </PortalShell>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  statusRow: { alignItems: 'flex-start' },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
});
