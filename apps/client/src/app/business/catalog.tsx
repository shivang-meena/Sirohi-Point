import { formatMoney } from '@sirohi/domain';
import type { Banner, Product } from '@sirohi/contracts';
import type { ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DealSlideshow } from '@/components/deal-slideshow';
import { CatalogCategoryFilter } from '@/components/catalog-category-filter';
import { MarketplaceHeroSlider, type MarketplaceHeroSlide } from '@/components/marketplace-hero-slider';
import { PortalButton, PortalCard, PortalShell, StatusBadge } from '@/components/portal-ui';
import { ProductVisual } from '@/components/product-visual';
import { getB2BBanners, getB2BCatalog } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useAuth } from '@/state/auth-context';
import { useThemedStyles } from '@/theme/theme-context';

export default function BusinessCatalogScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { addToCart, cartCount } = useAppState();
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [inStock, setInStock] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 300); return () => clearTimeout(timer); }, [search]);
  const liveCatalog = useQuery({
    queryKey: ['catalog', 'b2b', user?.id, debouncedSearch, selectedCategoryIds, selectedSubcategoryIds, page, sort, inStock],
    queryFn: () => getB2BCatalog(token!, {
      search: debouncedSearch,
      categoryIds: selectedCategoryIds,
      subcategoryIds: selectedSubcategoryIds,
      limit: 24,
      offset: page * 24,
      sort,
      inStock: String(inStock),
    }),
    enabled: user?.role === 'BUSINESS' && Boolean(token),
  });
  const bannerQuery = useQuery({ queryKey: ['banners', 'b2b'], queryFn: getB2BBanners });
  const products = liveCatalog.data ?? [];
  const filtered = useMemo(() => products.filter((product) => {
    const query = debouncedSearch.trim().toLowerCase();
    return !query || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
  }), [products, debouncedSearch]);
  const slides = useMemo(() => buildBusinessSlides(bannerQuery.data ?? [], products), [bannerQuery.data, products]);
  const offers = useMemo(() => products.filter((product) => Boolean(product.b2cPriceInPaise && (product.b2bPriceInPaise ?? product.priceInPaise) < product.b2cPriceInPaise)), [products]);

  return (
    <PortalShell eyebrow="B2B CATALOGUE" title="Wholesale pricing, clearly listed." copy="Every product card shows the B2B price, minimum order quantity, stock position, and backorder policy." actions={<View style={styles.headerActions}><PortalButton label="View my orders" secondary onPress={() => router.push('/business/orders' as never)} /><PortalButton label={`Bulk cart${cartCount ? ` (${cartCount})` : ''}`} onPress={() => router.push('/business/cart' as never)} /></View>}>
      {user?.role === 'BUSINESS' && slides.length ? <MarketplaceHeroSlider slides={slides} onProductPress={(product) => router.push(`/business/product/${product.id}` as never)} /> : null}
      {user?.role === 'BUSINESS' && offers.length ? <DealSlideshow products={offers} title="Wholesale offers" priceSegment="B2B" onProductPress={(product) => router.push(`/business/product/${product.id}` as never)} /> : null}
      <View style={styles.headerActions}>{(['newest', 'price-asc', 'price-desc'] as const).map((value) => <PortalButton key={value} label={value === 'newest' ? 'Newest' : value === 'price-asc' ? 'Price: low to high' : 'Price: high to low'} secondary={sort !== value} onPress={() => { setSort(value); setPage(0); }} />)}<PortalButton label={inStock ? '✓ In stock only' : 'In stock only'} secondary={!inStock} onPress={() => { setInStock(!inStock); setPage(0); }} /></View>
      <View style={styles.toolbar}><TextInput accessibilityLabel="Search wholesale products" value={search} onChangeText={setSearch} placeholder="Search products, brands, or categories" placeholderTextColor={styles.placeholder.color} style={styles.search} /><Text style={styles.resultCount}>{filtered.length} products</Text></View>
      <CatalogCategoryFilter
        selectedCategoryIds={selectedCategoryIds}
        selectedSubcategoryIds={selectedSubcategoryIds}
        onCategoryIdsChange={(ids) => { setSelectedCategoryIds(ids); setPage(0); }}
        onSubcategoryIdsChange={(ids) => { setSelectedSubcategoryIds(ids); setPage(0); }}
        onClearAll={() => { setSelectedCategoryIds([]); setSelectedSubcategoryIds([]); setPage(0); }}
      />
      {user?.role !== 'BUSINESS' ? <View style={styles.authNotice}><Text style={styles.authTitle}>Business sign-in required for B2B prices</Text><Text style={styles.authCopy}>Sign in as a business to load products, wholesale prices, minimum quantities, and stock from the protected B2B endpoint.</Text><PortalButton label="Business sign in" onPress={() => router.push('/business/login' as never)} /></View> : null}
      {liveCatalog.isLoading ? <Text style={styles.resultCount}>Loading products from the backend…</Text> : null}
      {liveCatalog.isError ? <Text style={styles.error}>Unable to load the B2B catalogue: {liveCatalog.error instanceof Error ? liveCatalog.error.message : 'Unknown error'}</Text> : null}
      {!liveCatalog.isLoading && !liveCatalog.isError && !filtered.length ? <PortalCard title="No B2B products found" copy="Products and wholesale terms will appear here when they are active in the database." /> : null}
      <View style={styles.grid}>
        {filtered.map((product) => {
          const b2bPrice = product.b2bPriceInPaise ?? product.priceInPaise;
          const minimum = product.minimumB2BQuantity ?? 1;
          return <PortalCard key={product.id}>
            <Pressable onPress={() => router.push(`/business/product/${product.id}` as never)} style={styles.productTop}><ProductVisual product={product} compact /><View style={styles.productBody}><Text style={styles.brand}>{product.brand}</Text><Text style={styles.name}>{product.name}</Text><Text style={styles.category}>{product.category}</Text></View></Pressable>
            <View style={styles.priceRow}><View><Text style={styles.price}>{formatMoney(b2bPrice)}</Text><Text style={styles.priceNote}>B2B price · GST extra if applicable</Text></View><StatusBadge label={product.allowB2BBackorder ? 'Backorder allowed' : `${product.stock} available`} tone={product.allowB2BBackorder ? 'warning' : 'success'} /></View>
            <View style={styles.moqRow}><Text style={styles.moq}>Minimum order: {minimum} units</Text><Text style={styles.stock}>{product.stock} units on hand</Text></View>
            <View style={styles.actions}><PortalButton label="View details" secondary onPress={() => router.push(`/business/product/${product.id}` as never)} /><PortalButton label={`Add ${minimum} to cart`} onPress={() => { addToCart(product, minimum); }} /></View>
          </PortalCard>;
        })}
      </View>
      <View style={styles.headerActions}><PortalButton label="Previous page" secondary disabled={page === 0 || liveCatalog.isFetching} onPress={() => setPage(page - 1)} /><Text style={styles.resultCount}>Page {page + 1}</Text><PortalButton label="Next page" secondary disabled={products.length < 24 || liveCatalog.isFetching} onPress={() => setPage(page + 1)} /></View>
    </PortalShell>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  search: { flex: 1, minWidth: 220, minHeight: 46, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 6, backgroundColor: colors.surface, color: colors.cream, fontSize: 13 },
  placeholder: { color: colors.muted },
  resultCount: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  productTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  productBody: { flex: 1 },
  brand: { color: colors.teal, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  name: { color: colors.cream, fontSize: 16, fontWeight: '900', marginTop: 3 },
  category: { color: colors.muted, fontSize: 11, marginTop: 4 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  price: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  priceNote: { color: colors.muted, fontSize: 10, marginTop: 3 },
  moqRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  moq: { color: colors.copper, fontSize: 11, fontWeight: '900' },
  stock: { color: colors.muted, fontSize: 11 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  authNotice: { padding: 15, borderRadius: 8, backgroundColor: colors.copperTint, borderWidth: 1, borderColor: colors.copper, gap: 8 },
  authTitle: { color: colors.cream, fontSize: 13, fontWeight: '900' },
  authCopy: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  error: { color: colors.copper, fontSize: 11, fontWeight: '800' },
});

function buildBusinessSlides(banners: Banner[], products: Product[]): MarketplaceHeroSlide[] {
  if (!products.length) return [];
  return banners.filter((banner) => banner.active).map((banner, index) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    badge: banner.badge,
    ctaLabel: banner.ctaLabel,
    backgroundColor: banner.backgroundColor,
    imageUrl: banner.imageUrl,
    product: products.find((product) => product.id === banner.productId) ?? products[index % products.length],
  }));
}
