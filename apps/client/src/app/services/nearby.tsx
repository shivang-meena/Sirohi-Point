import { technicianServiceTypes } from '@sirohi/contracts';
import { formatMoney } from '@sirohi/domain';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { PortalButton, PortalCard, PortalShell } from '@/components/portal-ui';
import { getCustomerAddresses, getNearbyContractors } from '@/lib/api';
import { useAuth } from '@/state/auth-context';
import { useAppTheme } from '@/theme/theme-context';

export default function NearbyServicesScreen() {
  const params = useLocalSearchParams<{ serviceType?: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, token } = useAuth();
  const [area, setArea] = useState('');
  const [trade, setTrade] = useState(params.serviceType ?? '');
  const [radius, setRadius] = useState('15');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [profileLocationApplied, setProfileLocationApplied] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<{ area?: string; serviceType?: string; latitude?: number; longitude?: number; nearbyOnly: boolean; radiusKm: number }>({ ...(params.serviceType ? { serviceType: params.serviceType } : {}), nearbyOnly: true, radiusKm: 15 });
  const addresses = useQuery({ queryKey: ['customer-addresses', user?.id], queryFn: () => getCustomerAddresses(token!), enabled: user?.role === 'CUSTOMER' && Boolean(token) });
  const nearby = useQuery({ queryKey: ['services', 'nearby', filter], queryFn: () => getNearbyContractors(filter) });
  const selectedAddress = addresses.data?.find((item) => item.id === selectedAddressId);
  const serviceOptions = useMemo(() => Array.from(new Set([...technicianServiceTypes, ...(nearby.data?.flatMap((technician) => technician.services.map((service) => service.serviceType)) ?? [])])), [nearby.data]);

  useEffect(() => {
    const preferred = addresses.data?.find((item) => item.isDefault) ?? addresses.data?.[0];
    if (preferred && !selectedAddressId) useAddress(preferred.id);
  }, [addresses.data, selectedAddressId]);

  useEffect(() => {
    const profileLocation = user?.role === 'CUSTOMER' ? user.customerLocation?.trim() : undefined;
    if (!profileLocation || profileLocationApplied || selectedAddressId || area.trim()) return;
    setArea(profileLocation);
    setFilter((current) => ({ ...current, area: profileLocation }));
    setProfileLocationApplied(true);
  }, [area, profileLocationApplied, selectedAddressId, user?.customerLocation, user?.role]);

  function search(location?: { latitude: number; longitude: number }) {
    const distance = Number(radius);
    if (!Number.isFinite(distance) || distance <= 0 || distance > 500) { setError('Radius must be between 1 and 500 km.'); return; }
    setError('');
    setFilter({ ...(area.trim() ? { area: area.trim() } : {}), ...(trade.trim() ? { serviceType: trade.trim() } : {}), ...location, nearbyOnly: true, radiusKm: distance });
  }
  function useAddress(id: string) {
    const address = addresses.data?.find((item) => item.id === id);
    if (!address) return;
    const distance = Number(radius);
    if (!Number.isFinite(distance) || distance <= 0 || distance > 500) { setError('Radius must be between 1 and 500 km.'); return; }
    setSelectedAddressId(id); setArea(address.city); setError('');
    setFilter({ ...(trade.trim() ? { serviceType: trade.trim() } : {}), area: address.city, ...(address.latitude !== undefined && address.longitude !== undefined ? { latitude: address.latitude, longitude: address.longitude } : {}), nearbyOnly: true, radiusKm: distance });
  }
  function selectService(serviceType: string) {
    setTrade(serviceType);
    setFilter((current) => ({ ...current, serviceType, nearbyOnly: true }));
  }
  function clearService() {
    setTrade('');
    setFilter((current) => {
      const { serviceType: _serviceType, ...withoutService } = current;
      return withoutService;
    });
  }
  function locate() {
    if (Platform.OS !== 'web' || !navigator.geolocation) { setError('Location is unavailable here. Use your saved address or search by area.'); return; }
    navigator.geolocation.getCurrentPosition((position) => search({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => setError('Location permission was not available. You can search by area.'), { timeout: 10000 });
  }
  return <PortalShell eyebrow="NEARBY TECHNICIANS" title="Find a nearby specialist for your service." copy="Choose a service, then combine it with your saved address, area, or current location. Results must provide that service and match the selected location." includeSignOut={false} actions={<><PortalButton label="Explore all technicians" secondary onPress={() => router.push('/services')} /><PortalButton label="View my request" onPress={() => router.push('/services/bookings')} /></>}>
    {user?.role === 'CUSTOMER' ? <PortalCard title="Search from a saved address" copy="Your signup location is used first. A saved address can give the service search a more precise priority."><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{addresses.isLoading ? <Text style={{ color: colors.muted }}>Loading saved addresses…</Text> : addresses.data?.length ? addresses.data.map((address) => <PortalButton key={address.id} label={`${address.label}: ${address.city}${address.isDefault ? ' (default)' : ''}`} secondary={selectedAddressId !== address.id} onPress={() => useAddress(address.id)} />) : <Text style={{ color: colors.muted }}>{user.customerLocation ? `Using your signup location: ${user.customerLocation}. Add an address when booking for more precise results.` : 'No address saved yet. You can add one in the service request form.'}</Text>}</View>{selectedAddress ? <Text style={{ color: colors.cream }}>Using {selectedAddress.line1}, {selectedAddress.city}</Text> : null}</PortalCard> : null}
    <PortalCard title="Choose a service" copy="Only technicians who provide the selected service appear in these nearby results."><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><PortalButton label="All services" secondary={Boolean(trade)} onPress={clearService} />{serviceOptions.map((serviceType) => <Pressable key={serviceType} accessibilityRole="radio" accessibilityState={{ checked: trade.toLowerCase() === serviceType.toLowerCase() }} onPress={() => selectService(serviceType)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 6, borderColor: trade.toLowerCase() === serviceType.toLowerCase() ? colors.teal : colors.line, backgroundColor: trade.toLowerCase() === serviceType.toLowerCase() ? colors.tealTint : colors.surfaceSunken }}><Text style={{ color: trade.toLowerCase() === serviceType.toLowerCase() ? colors.teal : colors.cream, fontWeight: '800' }}>{serviceType}</Text></Pressable>)}</View></PortalCard>
    <PortalCard title="Search technicians"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{[['Area or city', area, setArea], ['Service type (custom)', trade, setTrade], ['Radius (km)', radius, setRadius]].map(([label, value, setter]) => <TextInput key={String(label)} accessibilityLabel={String(label)} placeholder={String(label)} placeholderTextColor={colors.muted} value={String(value)} onChangeText={setter as (value: string) => void} style={{ padding: 12, borderWidth: 1, borderColor: colors.line, color: colors.cream, minWidth: 180 }} />)}</View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><PortalButton label="Search area" onPress={() => search()} />{Platform.OS === 'web' ? <PortalButton label="Use my location" secondary onPress={locate} /> : null}</View>{error ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text> : null}</PortalCard>
    {nearby.isLoading ? <PortalCard copy="Searching technicians…" /> : nearby.isError ? <PortalCard copy={nearby.error.message}><PortalButton label="Retry search" onPress={() => void nearby.refetch()} /></PortalCard> : !nearby.data?.length ? <PortalCard title="No specialists found" copy="Try another area, a different service, or a wider radius." /> : null}
    {nearby.data?.map((technician) => <PortalCard key={technician.id} title={technician.name} copy={[(filter.latitude !== undefined || filter.area) ? 'Nearby service match' : 'Available service match', technician.serviceArea, technician.distanceKm === undefined ? 'Distance unavailable' : technician.distanceKm + ' km away', technician.experienceYears === undefined ? '' : technician.experienceYears + ' years experience'].filter(Boolean).join(' · ')}>
      {technician.services.filter((service) => !filter.serviceType || service.serviceType.toLowerCase() === filter.serviceType.toLowerCase()).map((service) => <View key={service.id} style={{ gap: 8 }}><Text style={{ color: colors.cream }}>{service.serviceType} · Visit {formatMoney(service.visitChargeInPaise)}</Text>{service.description ? <Text style={{ color: colors.muted }}>{service.description}</Text> : null}<PortalButton label="Request this service" onPress={() => user?.role === 'CUSTOMER' ? router.push({ pathname: '/services/booking', params: { contractorId: technician.id, serviceType: service.serviceType } }) : router.push('/customer/login')} /></View>)}
      <PortalButton label="View profile and prices" secondary onPress={() => router.push({ pathname: '/services/booking', params: { contractorId: technician.id } })} />
    </PortalCard>)}
  </PortalShell>;
}
