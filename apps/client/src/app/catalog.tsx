import { radius, spacing, type ThemeColors } from '@sirohi/design-tokens';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppShell } from '@/components/app-shell';
import { CatalogCategoryFilter } from '@/components/catalog-category-filter';
import { ProductCard } from '@/components/product-card';
import { getCatalog } from '@/lib/api';
import { useAppState } from '@/state/app-context';
import { useCustomerStyles as useThemedStyles } from '@/theme/customer-theme';

type SortMode = 'recommended' | 'priceAsc' | 'priceDesc' | 'rating';

const sortOptions: [SortMode, string][] = [
  ['recommended', 'Recommended'],
  ['priceAsc', 'Price: low to high'],
  ['priceDesc', 'Price: high to low'],
  ['rating', 'Avg. customer rating'],
];

export default function CatalogScreen() {
  const params = useLocalSearchParams<{ category?: string; saved?: string; q?: string }>();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [search, setSearch] = useState(params.q ?? '');
  const [savedOnly, setSavedOnly] = useState(params.saved === '1');
  const [sort, setSort] = useState<SortMode>('recommended');
  const { wishlist } = useAppState();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const cardWidth = width >= 1200 ? '19.2%' : width >= 900 ? '24.2%' : width >= 640 ? '32.6%' : '48.8%';
  const catalog = useQuery({
    queryKey: ['catalog', 'b2c', { categoryIds: selectedCategoryIds, subcategoryIds: selectedSubcategoryIds }],
    queryFn: () => getCatalog({ categoryIds: selectedCategoryIds, subcategoryIds: selectedSubcategoryIds }),
  });

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (catalog.data ?? []).filter((product) => {
      const matchesSearch = !query
        || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
      const matchesSaved = !savedOnly || wishlist.includes(product.id);
      return matchesSearch && matchesSaved;
    });
    if (sort === 'priceAsc') return [...filtered].sort((a, b) => a.priceInPaise - b.priceInPaise);
    if (sort === 'priceDesc') return [...filtered].sort((a, b) => b.priceInPaise - a.priceInPaise);
    if (sort === 'rating') return [...filtered].sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [catalog.data, savedOnly, search, sort, wishlist]);

  function resetDiscovery() {
    setSearch('');
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setSavedOnly(false);
    setSort('recommended');
  }

  return (
    <AppShell>
      <View style={styles.content}>
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumb}>
            {savedOnly ? 'Your saved products' : search ? `Results for "${search}"` : selectedCategoryIds.length ? 'Filtered products' : 'All products'}
          </Text>
          <Text style={styles.resultCount}>{products.length} results</Text>
        </View>

        <View style={styles.toolRow}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: savedOnly }}
            onPress={() => setSavedOnly((current) => !current)}
            style={[styles.savedFilter, savedOnly && styles.savedFilterActive]}
          >
            <Text style={[styles.savedFilterIcon, savedOnly && styles.savedFilterTextActive]}>
              {savedOnly ? '♥' : '♡'}
            </Text>
            <Text style={[styles.savedFilterText, savedOnly && styles.savedFilterTextActive]}>
              Saved ({wishlist.length})
            </Text>
          </Pressable>
          <View style={styles.sortGroup}>
            <Text style={styles.sortLabel}>Sort by</Text>
            {sortOptions.map(([value, label]) => (
              <Pressable key={value} onPress={() => setSort(value)} style={[styles.sortButton, sort === value && styles.sortButtonActive]}>
                <Text style={[styles.sortText, sort === value && styles.sortTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <CatalogCategoryFilter
          initialCategory={params.category}
          selectedCategoryIds={selectedCategoryIds}
          selectedSubcategoryIds={selectedSubcategoryIds}
          onCategoryIdsChange={setSelectedCategoryIds}
          onSubcategoryIdsChange={setSelectedSubcategoryIds}
          onClearAll={() => { setSelectedCategoryIds([]); setSelectedSubcategoryIds([]); }}
        />

        {catalog.isLoading ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>Loading products…</Text></View>
        ) : null}

        {catalog.isError ? <Text style={styles.error}>Unable to load products from the backend: {catalog.error instanceof Error ? catalog.error.message : 'Unknown error'}</Text> : null}

        {!catalog.isLoading && products.length ? (
          <View style={styles.grid}>
            {products.map((product) => <ProductCard key={product.id} product={product} width={cardWidth} />)}
          </View>
        ) : null}

        {!catalog.isLoading && !products.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{catalog.isError ? 'Products are unavailable.' : savedOnly ? 'No saved products yet.' : 'No products match this search.'}</Text>
            <Text style={styles.emptyCopy}>{catalog.isError ? 'Check the API connection and try again.' : 'Try another category or clear your current filters.'}</Text>
            <Pressable onPress={resetDiscovery} style={styles.resetButton}>
              <Text style={styles.reset}>Clear filters</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </AppShell>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { width: '100%', maxWidth: 1500, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.md },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  breadcrumb: { color: colors.cream, fontSize: 22, fontWeight: '900' },
  resultCount: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  error: { color: colors.copper, fontSize: 11, fontWeight: '800' },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.line },
  savedFilter: { minHeight: 34, paddingHorizontal: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6 },
  savedFilterActive: { borderColor: colors.cta, backgroundColor: colors.copperTint },
  savedFilterIcon: { color: colors.muted, fontSize: 14 },
  savedFilterText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  savedFilterTextActive: { color: colors.cta },
  sortGroup: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  sortLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', marginRight: 4 },
  sortButton: { minHeight: 30, paddingHorizontal: spacing.sm, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  sortButtonActive: { backgroundColor: colors.surfaceRaised },
  sortText: { color: colors.muted, fontSize: 11.5, fontWeight: '700' },
  sortTextActive: { color: colors.cream, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  empty: { minHeight: 240, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { color: colors.cream, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  resetButton: { minHeight: 38, paddingHorizontal: spacing.lg, borderRadius: radius.sm, backgroundColor: colors.primary, justifyContent: 'center', marginTop: spacing.xs },
  reset: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

