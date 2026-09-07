import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { getBusinessProfile } from '@/lib/api';
import { useAuth } from '@/state/auth-context';
import { useAppTheme } from '@/theme/theme-context';

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { token, user } = useAuth();
  const profile = useQuery({ queryKey: ['auth', 'business-profile', user?.id], queryFn: () => getBusinessProfile(token!), enabled: user?.role === 'BUSINESS' && Boolean(token) });
  return <PortalShell eyebrow="B2B ACCOUNT" title="Business profile" copy="These approved business details identify the account that receives B2B prices and minimum-quantity rules." actions={<PortalButton label="Back to B2B home" onPress={() => router.replace('/business' as never)} />}>
    {profile.isLoading ? <PortalCard copy="Loading business details from the backend…" /> : null}
    {profile.isError ? <PortalCard title="Profile unavailable" copy="Business details could not be loaded. Return to the B2B home and try again." /> : null}
    {profile.data ? <PortalCard title={profile.data.businessName} copy={`${user?.name ?? ''} · ${user?.email ?? ''}`}><StatusBadge label={profile.data.approvalStatus} tone={profile.data.approvalStatus === 'APPROVED' ? 'success' : profile.data.approvalStatus === 'REJECTED' ? 'danger' : 'warning'} /><View style={{ gap: 6 }}><Text style={{ color: colors.muted }}>Business type: {profile.data.businessType ?? 'Not provided'}</Text><Text style={{ color: colors.muted }}>GSTIN: {profile.data.gstin ?? 'Not provided'}</Text><Text style={{ color: colors.cream }}>Billing address: {profile.data.billingAddress}</Text>{profile.data.shippingAddress ? <Text style={{ color: colors.cream }}>Shipping address: {profile.data.shippingAddress}</Text> : null}</View></PortalCard> : null}
  </PortalShell>;
}
