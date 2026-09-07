import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import Head from 'expo-router/head';
import { SymbolView } from 'expo-symbols';
import { usePathname, useRouter } from 'expo-router';
import { useState, type PropsWithChildren } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useAppTheme, useThemedStyles } from '@/theme/theme-context';
import { CustomerStoreShell } from '@/components/customer-store-shell';

type AppIconName = 'home' | 'shop' | 'cart' | 'account' | 'business' | 'orders' | 'workspace' | 'requests' | 'profile' | 'saved' | 'menu';

const customerNav = [
  { href: '/customer', label: 'Home', icon: 'home' },
  { href: '/catalog', label: 'Shop', icon: 'shop' },
  { href: '/cart', label: 'Cart', icon: 'cart' },
  { href: '/dashboard', label: 'Account', icon: 'account' },
] as const;

const businessNav = [
  { href: '/business', label: 'Business', icon: 'business' },
  { href: '/business/catalog', label: 'Bulk catalogue', icon: 'shop' },
  { href: '/business/cart', label: 'Bulk cart', icon: 'cart' },
  { href: '/business/orders', label: 'Orders', icon: 'orders' },
  { href: '/business/profile', label: 'Profile', icon: 'profile' },
] as const;

const technicianNav = [
  { href: '/technician', label: 'Workspace', icon: 'workspace' },
  { href: '/technician/bookings', label: 'Requests', icon: 'requests' },
  { href: '/technician/profile', label: 'Profile', icon: 'profile' },
] as const;

const categoryLinks = [
  { label: 'All products', href: '/catalog' },
  { label: 'Hardware', href: '/catalog', params: { category: 'Hardware' } },
  { label: 'Electrical', href: '/catalog', params: { category: 'Electrical' } },
  { label: 'Electronics', href: '/catalog', params: { category: 'Electronics' } },
  { label: 'Paint', href: '/catalog', params: { category: 'Paint' } },
  { label: 'Plumbing', href: '/catalog', params: { category: 'PVC & Plumbing' } },
  { label: 'Sanitary', href: '/catalog', params: { category: 'Sanitary' } },
  { label: 'Explore technicians', href: '/services/nearby' },
] as const;

export function AppShell({ children, scroll = true, entry = false }: PropsWithChildren<{ scroll?: boolean; entry?: boolean }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { cartCount, wishlist } = useAppState();
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [search, setSearch] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const desktop = width >= 960;
  const businessPortal = pathname.startsWith('/business');
  const technicianPortal = pathname.startsWith('/technician');
  const storeControls = !entry && !businessPortal && !technicianPortal;
  const homePath = entry ? '/' : businessPortal ? '/business' : technicianPortal ? '/technician' : '/customer';
  const cartPath = businessPortal ? '/business/cart' : '/cart';
  const activeNav = businessPortal ? businessNav : technicianPortal ? technicianNav : customerNav;
  const accountPath = !user ? '/' : user.role === 'BUSINESS' ? '/business' : user.role === 'CONTRACTOR' ? '/technician' : user.role === 'ADMIN' ? '/admin' : '/dashboard';
  const visibleCategoryLinks = user?.role === 'CUSTOMER'
    ? [{ label: 'Home', href: '/customer' }, ...categoryLinks]
    : categoryLinks;

  function navigate(href: string, params?: Record<string, string>) {
    router.push(params ? { pathname: href as never, params } : href as never);
  }

  function submitSearch() {
    const query = search.trim();
    Keyboard.dismiss();
    navigate('/catalog', query ? { q: query } : undefined);
  }

  if (storeControls && !pathname.startsWith('/admin')) return <CustomerStoreShell scroll={scroll}>{children}</CustomerStoreShell>;

  const body = (
    <>
      {children}
      {!entry ? <SiteFooter styles={styles} navigate={navigate} portal={businessPortal ? 'business' : technicianPortal ? 'technician' : 'customer'} /> : null}
    </>
  );

  return (
    <>
      <Head><title>Sirohi Point | Shop Products for Home and Business</title></Head>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={[styles.headerInner, desktop && styles.headerInnerDesktop]}>
            <Pressable accessibilityRole="link" accessibilityLabel="Sirohi Point home" onPress={() => navigate(homePath)} style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
              <View style={styles.logoFrame}><Image source={require('../../assets/images/logo_sirohi.png')} style={styles.logo} resizeMode="contain" /></View>
              <Text style={styles.brandName}>SIROHI POINT</Text>
            </Pressable>

            {desktop && !entry && !technicianPortal ? (
              <View style={styles.location}>
                <Text style={styles.locationPin}>⌖</Text>
                <View><Text style={styles.locationLabel}>Deliver to</Text><Text style={styles.locationValue}>{user?.role === 'CUSTOMER' && user.customerLocation ? user.customerLocation : 'Choose at checkout'}</Text></View>
              </View>
            ) : null}

            {desktop && storeControls ? <StoreSearch search={search} setSearch={setSearch} submitSearch={submitSearch} styles={styles} /> : null}

            <View style={styles.headerActions}>
              {!desktop && storeControls ? <Pressable accessibilityRole="button" accessibilityLabel="Browse categories" accessibilityState={{ expanded: categoryMenuOpen }} style={[styles.iconButton, categoryMenuOpen && styles.menuButtonActive]} onPress={() => setCategoryMenuOpen((open) => !open)}><AppIcon name="menu" color={colors.onPrimary} size={22} /></Pressable> : null}
              {storeControls ? <Pressable accessibilityRole="button" style={styles.accountButton} onPress={() => user ? void logout().then(() => router.replace('/')) : navigate('/')}>
                <Text style={styles.actionLabel}>{user ? 'Sign out' : 'Sign in / Register'}</Text>
              </Pressable> : null}
              {desktop && storeControls ? (
                <Pressable style={styles.accountButton} onPress={() => navigate(accountPath)}>
                  <Text style={styles.actionEyebrow}>Your account</Text><Text style={styles.actionLabel}>Orders &amp; account</Text>
                </Pressable>
              ) : null}
              {desktop && storeControls ? (
                <Pressable style={styles.iconButton} onPress={() => navigate('/catalog', { saved: '1' })} accessibilityLabel={`${wishlist.length} saved products`}>
                  <AppIcon name="saved" color={colors.onPrimary} size={20} />
                  <Counter value={wishlist.length} styles={styles} />
                </Pressable>
              ) : null}
              {!entry && (storeControls || businessPortal) ? <Pressable style={styles.iconButton} onPress={() => navigate(cartPath)} accessibilityLabel={`${cartCount} items in cart`}>
                <AppIcon name="cart" color={colors.onPrimary} size={20} />
                {desktop ? <Text style={styles.cartLabel}>Cart</Text> : null}
                <Counter value={cartCount} styles={styles} />
              </Pressable> : null}
            </View>
          </View>
        </View>

        {!desktop && storeControls ? <View style={styles.mobileSearchRow}><StoreSearch search={search} setSearch={setSearch} submitSearch={submitSearch} styles={styles} /></View> : null}

        {!desktop && storeControls && categoryMenuOpen ? (
          <View style={styles.mobileCategoryMenu}>
            <Text style={styles.mobileCategoryTitle}>Browse categories</Text>
            <View style={styles.mobileCategoryList}>
              {visibleCategoryLinks.map((item) => (
                <Pressable key={item.label} onPress={() => { setCategoryMenuOpen(false); navigate(item.href, 'params' in item ? item.params : undefined); }} style={styles.mobileCategoryLink}>
                  <Text style={styles.mobileCategoryLinkText}>{item.label}</Text>
                  <Text style={styles.mobileCategoryArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {desktop && storeControls ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryNav} contentContainerStyle={styles.categoryNavInner}>
            {visibleCategoryLinks.map((item) => (
              <Pressable key={item.label} onPress={() => navigate(item.href, 'params' in item ? item.params : undefined)} style={styles.categoryLink}>
                <Text style={styles.categoryLinkText}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.body}>
          {scroll ? (
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : body}
        </View>

        {!desktop && !entry ? (
          <View style={styles.bottomNav}>
            {activeNav.map((item) => (
              <NavButton key={item.label} label={item.label} icon={item.icon} active={pathname === item.href} onPress={() => navigate(item.href === '/dashboard' ? accountPath : item.href)} styles={styles} badge={item.href === '/cart' || item.href === '/business/cart' ? cartCount : 0} />
            ))}
          </View>
        ) : null}

        <Toast styles={styles} desktop={desktop} />
      </SafeAreaView>
    </>
  );
}

function Toast({ styles, desktop }: { styles: AppShellStyles; desktop: boolean }) {
  const { notice, dismissNotice } = useAppState();
  if (!notice) return null;
  return (
    <Pressable accessibilityRole="alert" onPress={dismissNotice} style={[styles.toast, !desktop && styles.toastMobile]}>
      <View style={styles.toastCheck}><Text style={styles.toastCheckText}>✓</Text></View><Text style={styles.toastText}>{notice}</Text><Text style={styles.toastClose}>×</Text>
    </Pressable>
  );
}

function SiteFooter({ styles, navigate, portal }: { styles: AppShellStyles; navigate(href: string, params?: Record<string, string>): void; portal: 'customer' | 'business' | 'technician' }) {
  const accountHref = portal === 'business' ? '/business' : portal === 'technician' ? '/technician' : '/dashboard';
  const cartHref = portal === 'business' ? '/business/cart' : '/cart';
  const homeHref = portal === 'business' ? '/business' : portal === 'technician' ? '/technician' : '/customer';
  return (
    <View style={styles.footer}>
      <View style={styles.footerColumns}>
        <FooterColumn styles={styles} heading="Get to know us">
          <FooterLink styles={styles} label="Sirohi Point home" onPress={() => navigate(homeHref)} />
        </FooterColumn>
        <FooterColumn styles={styles} heading="Let us help you">
          <FooterLink styles={styles} label={portal === 'technician' ? 'Technician workspace' : 'Your account'} onPress={() => navigate(accountHref)} />
          <FooterLink styles={styles} label={portal === 'technician' ? 'Service requests' : 'Your orders'} onPress={() => navigate(portal === 'technician' ? '/technician/bookings' : portal === 'business' ? '/business/orders' : accountHref)} />
          {portal !== 'technician' ? <FooterLink styles={styles} label={portal === 'business' ? 'Bulk cart' : 'Shopping cart'} onPress={() => navigate(cartHref)} /> : null}
        </FooterColumn>
        {portal === 'customer' ? <FooterColumn styles={styles} heading="Shop by category">
          <FooterLink styles={styles} label="Hardware" onPress={() => navigate('/catalog', { category: 'Hardware' })} />
          <FooterLink styles={styles} label="Electrical" onPress={() => navigate('/catalog', { category: 'Electrical' })} />
          <FooterLink styles={styles} label="Paint" onPress={() => navigate('/catalog', { category: 'Paint' })} />
        </FooterColumn> : null}
        <FooterColumn styles={styles} heading="Contact">
          <Text style={styles.footerText}>Contact details are provided by the platform.</Text>
          <Text style={styles.footerText}>Order and service support is available through your account.</Text>
        </FooterColumn>
      </View>
      <View style={styles.footerBottom}>
        <View style={styles.footerBrand}>
          <Image source={require('../../assets/images/logo_sirohi.png')} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerBrandName}>SIROHI POINT</Text>
        </View>
        <Text style={styles.footerLegal}>© {new Date().getFullYear()} Sirohi Point · UPI · Cards · Net banking · Pay on delivery</Text>
      </View>
    </View>
  );
}

function FooterColumn({ heading, children, styles }: PropsWithChildren<{ heading: string; styles: AppShellStyles }>) {
  return <View style={styles.footerColumn}><Text style={styles.footerHeading}>{heading}</Text>{children}</View>;
}

function FooterLink({ label, onPress, styles }: { label: string; onPress(): void; styles: AppShellStyles }) {
  return <Pressable onPress={onPress}><Text style={styles.footerLink}>{label}</Text></Pressable>;
}

type AppShellStyles = ReturnType<typeof createStyles>;

function StoreSearch({ search, setSearch, submitSearch, styles }: { search: string; setSearch(value: string): void; submitSearch(): void; styles: AppShellStyles }) {
  return (
    <View style={styles.searchBox}>
      <TextInput value={search} onChangeText={setSearch} onSubmitEditing={submitSearch} placeholder="Search products, brands and categories" placeholderTextColor={styles.searchPlaceholder.color} style={styles.searchInput} accessibilityLabel="Search the Sirohi Point store" returnKeyType="search" autoCapitalize="none" />
      <Pressable style={styles.searchButton} onPress={submitSearch} accessibilityLabel="Search"><Text style={styles.searchButtonText}>⌕</Text></Pressable>
    </View>
  );
}

function Counter({ value, styles }: { value: number; styles: AppShellStyles }) {
  return value > 0 ? <View style={styles.counter}><Text style={styles.counterText}>{value}</Text></View> : null;
}

function AppIcon({ name, color, size }: { name: AppIconName; color: string; size: number }) {
  const symbols = {
    home: { ios: 'house', android: 'home', web: 'home' },
    shop: { ios: 'storefront', android: 'storefront', web: 'storefront' },
    cart: { ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' },
    account: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
    business: { ios: 'briefcase', android: 'business_center', web: 'business_center' },
    orders: { ios: 'doc.text', android: 'receipt_long', web: 'receipt_long' },
    workspace: { ios: 'wrench.and.screwdriver', android: 'build', web: 'build' },
    requests: { ios: 'checklist', android: 'assignment', web: 'assignment' },
    profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
    saved: { ios: 'heart', android: 'favorite', web: 'favorite' },
    menu: { ios: 'line.3.horizontal', android: 'menu', web: 'menu' },
  } as const;
  return <SymbolView name={symbols[name] as never} size={size} tintColor={color} weight="semibold" />;
}

function NavButton({ label, icon, active, onPress, styles, badge }: { label: string; icon: AppIconName; active: boolean; onPress(): void; styles: AppShellStyles; badge: number }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="link" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.navCompact, pressed && styles.pressed]}>
      <View style={[styles.navIconFrame, active && styles.navIconFrameActive]}><AppIcon name={icon} color={active ? colors.teal : colors.muted} size={18} />{badge > 0 ? <View style={styles.navBadge}><Text style={styles.navBadgeText}>{badge}</Text></View> : null}</View>
      <Text style={[styles.navCompactText, active && styles.navTextActive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.ink },
  header: { minHeight: 64, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.header, zIndex: 20 },
  headerInner: { width: '100%', maxWidth: 1500, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerInnerDesktop: { minHeight: 48 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoFrame: { width: 38, height: 38, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.surface },
  logo: { width: 54, height: 54, transform: [{ translateX: -8 }, { translateY: -7 }] },
  brandName: { color: colors.onPrimary, fontWeight: '900', fontSize: 15, letterSpacing: 0.4 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  locationPin: { color: colors.onPrimary, fontSize: 15 },
  locationLabel: { color: colors.onPrimaryMuted, fontSize: 10, fontWeight: '700' },
  locationValue: { color: colors.onPrimary, fontSize: 12, fontWeight: '900', marginTop: 1 },
  searchBox: { flex: 1, minWidth: 0, minHeight: 40, flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, backgroundColor: colors.surface, overflow: 'hidden' },
  searchInput: { flex: 1, minWidth: 60, paddingHorizontal: spacing.md, color: colors.cream, fontSize: 14 },
  searchPlaceholder: { color: colors.muted },
  searchButton: { width: 46, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cta },
  searchButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  mobileSearchRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.header, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  mobileCategoryMenu: { backgroundColor: colors.subheader, borderBottomWidth: 1, borderBottomColor: colors.line, padding: spacing.md, gap: spacing.sm, zIndex: 15 },
  mobileCategoryTitle: { color: colors.onPrimaryMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  mobileCategoryList: { gap: 4 },
  mobileCategoryLink: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.06)' },
  mobileCategoryLinkText: { color: colors.onPrimary, fontSize: 13, fontWeight: '800' },
  mobileCategoryArrow: { color: colors.copperBright, fontSize: 21, fontWeight: '500', lineHeight: 22 },
  headerActions: { flexDirection: 'row', marginLeft: 'auto', gap: spacing.xs, alignItems: 'center' },
  accountButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  actionEyebrow: { color: colors.onPrimaryMuted, fontSize: 9, fontWeight: '700' },
  actionLabel: { color: colors.onPrimary, fontSize: 12, fontWeight: '900' },
  iconButton: { minHeight: 40, minWidth: 40, paddingHorizontal: spacing.sm, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  menuButtonActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  cartLabel: { color: colors.onPrimary, fontSize: 12, fontWeight: '900' },
  counter: { position: 'absolute', right: -3, top: -3, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: colors.cta, borderWidth: 2, borderColor: colors.header, alignItems: 'center', justifyContent: 'center' },
  counterText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  categoryNav: { flexGrow: 0, backgroundColor: colors.subheader },
  categoryNavInner: { width: '100%', maxWidth: 1500, alignSelf: 'center', minHeight: 38, alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg },
  categoryLink: { minHeight: 38, justifyContent: 'center' },
  categoryLinkText: { color: colors.onPrimary, fontSize: 12.5, fontWeight: '700' },
  body: { flex: 1, backgroundColor: colors.ink },
  scrollContent: { paddingBottom: Platform.OS === 'web' ? 0 : 106, flexGrow: 1 },
  bottomNav: { flexDirection: 'row', minHeight: 62, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.nav, paddingHorizontal: spacing.xs, paddingBottom: Platform.OS === 'ios' ? 8 : 2 },
  navCompact: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: radius.sm, marginVertical: 5 },
  navIconFrame: { width: 30, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  navIconFrameActive: { backgroundColor: colors.tealTint },
  navCompactText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  navTextActive: { color: colors.teal },
  navBadge: { position: 'absolute', right: -12, top: -4, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: colors.cta, alignItems: 'center', justifyContent: 'center' },
  navBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  toast: { position: 'absolute', right: spacing.xl, bottom: spacing.xl, maxWidth: 380, minHeight: 54, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceRaised, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, zIndex: 50, shadowColor: colors.shadow, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  toastMobile: { left: spacing.md, right: spacing.md, bottom: 74 },
  toastCheck: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successTint },
  toastCheckText: { color: colors.success, fontWeight: '900' },
  toastText: { flex: 1, color: colors.cream, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  toastClose: { color: colors.muted, fontSize: 18 },
  footer: { backgroundColor: colors.footer, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  footerColumns: { width: '100%', maxWidth: 1500, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  footerColumn: { flexBasis: 200, flexGrow: 1, gap: spacing.sm },
  footerHeading: { color: colors.footerText, fontSize: 13, fontWeight: '900', marginBottom: 2 },
  footerLink: { color: colors.footerMuted, fontSize: 12.5, lineHeight: 22 },
  footerText: { color: colors.footerMuted, fontSize: 12.5, lineHeight: 20 },
  footerBottom: { width: '100%', maxWidth: 1500, alignSelf: 'center', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerLogo: { width: 28, height: 28, borderRadius: radius.xs },
  footerBrandName: { color: colors.footerText, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  footerLegal: { color: colors.footerMuted, fontSize: 11 },
  pressed: { opacity: 0.72 },
});
