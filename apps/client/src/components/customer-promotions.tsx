import type { Banner, Product } from '@sirohi/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export const customerCollections = [
  { category: 'Paint', title: 'A fresh colour.\nA fresh beginning.', copy: 'Give your favourite spaces a little more personality.', label: 'THE HOME REFRESH', color: '#213C57', accent: '#FFB990', image: require('../../assets/images/products/paint-interior-emulsion.png') },
  { category: 'Sanitary', title: 'Small details.\nBeautiful spaces.', copy: 'Finishing touches that make your bathroom feel complete.', label: 'EVERYDAY ELEVATED', color: '#264B50', accent: '#A9E2D8', image: require('../../assets/images/products/sanitary-basin-mixer.png') },
  { category: 'Electrical', title: 'Make the switch\nto something better.', copy: 'Discover electrical essentials for every corner of your home.', label: 'SMART LITTLE UPGRADES', color: '#453652', accent: '#DBC5F0', image: require('../../assets/images/products/electrical-modular-switch.png') },
  { category: 'Hardware', title: 'Big ideas.\nStrong foundations.', copy: 'Everyday hardware that keeps every project together.', label: 'READY FOR YOUR NEXT PROJECT', color: '#4E392A', accent: '#FFD0A4', image: require('../../assets/images/products/hardware-pata-bolt.png') },
  { category: 'Electronics', title: 'A brighter way\nto come home.', copy: 'Explore lighting and electronics for spaces you love.', label: 'LIGHT UP THE EVERYDAY', color: '#243A63', accent: '#B6D3FF', image: require('../../assets/images/products/electronics-led-panel.png') },
  { category: 'PVC & Plumbing', title: 'Keep your plans\nflowing smoothly.', copy: 'Find the right fittings for repairs, upgrades and new beginnings.', label: 'THE PRACTICAL PICKS', color: '#2E4B40', accent: '#BDE4CC', image: require('../../assets/images/products/pvc-elbow.png') },
];

export function CustomerPromotions({ products, banners }: { products: Product[]; banners: Banner[] }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setInterval(() => setActive(value => (value + 1) % 6), 5500);
    return () => clearInterval(timer);
  }, [paused, reduceMotion]);
  const collection = customerCollections[active];
  const activeBanners = banners.filter(item => item.active && products.some(product => product.id === item.productId));
  const banner = activeBanners[active];
  const linkedProduct = banner ? products.find(product => product.id === banner.productId) : undefined;
  const savings = Math.max(0, ...products.filter(product => product.category === collection.category).map(product => product.compareAtPriceInPaise && product.compareAtPriceInPaise > product.priceInPaise ? Math.round((1 - product.priceInPaise / product.compareAtPriceInPaise) * 100) : 0));
  function openCollection() { if (linkedProduct) router.push(`/product/${linkedProduct.id}`); else router.push({ pathname: '/catalog', params: { category: collection.category } }); }
  function changeSlide(index: number) { setPaused(true); setActive((index + 6) % 6); }
  return <View style={[styles.hero, { backgroundColor: collection.color }]}>
    <View style={[styles.main, compact && styles.mainCompact]}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: collection.accent }]}>{banner?.badge || collection.label}</Text>
        <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>{banner?.title || collection.title}</Text>
        <Text style={styles.subtitle}>{banner?.subtitle || collection.copy}</Text>
        <Pressable accessibilityRole="link" onPress={openCollection} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}><Text style={styles.buttonText}>{banner?.ctaLabel || `Shop ${collection.category === 'PVC & Plumbing' ? 'plumbing' : collection.category.toLowerCase()}`}  →</Text></Pressable>
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel={linkedProduct ? `Shop ${linkedProduct.name}` : `Explore ${collection.category}`} onPress={openCollection} style={[styles.art, compact && styles.artCompact]}>
        <View style={[styles.artBackdrop, { backgroundColor: collection.accent }]} />
        <Image source={banner?.imageUrl ? { uri: banner.imageUrl } : linkedProduct?.imageUrl ? { uri: linkedProduct.imageUrl } : collection.image} style={styles.productImage} resizeMode="contain" />
        <View style={styles.offer}><Text style={styles.offerSmall}>{savings > 0 && !banner ? 'SAVE UP TO' : 'EXPLORE THE'}</Text><Text style={styles.offerLarge}>{savings > 0 && !banner ? `${savings}%` : 'Edit'}</Text><Text style={styles.offerSmall}>{savings > 0 && !banner ? 'ON SELECTED PICKS' : (linkedProduct?.category ?? collection.category).toUpperCase()}</Text></View>
      </Pressable>
    </View>
    <View style={styles.controls}><View style={styles.pagination}>{customerCollections.map((item, index) => <Pressable key={item.category} accessibilityRole="button" accessibilityLabel={`Show banner ${index + 1}: ${activeBanners[index]?.title ?? item.category}`} accessibilityState={{ selected: active === index }} onPress={() => changeSlide(index)} style={styles.dotHit}><View style={[styles.dot, active === index && styles.activeDot]} /></Pressable>)}</View><View style={styles.controlButtons}><Text style={styles.counter}>0{active + 1} / 06</Text><Pressable accessibilityRole="button" accessibilityLabel={paused || reduceMotion ? 'Play promotional banners' : 'Pause promotional banners'} onPress={() => { setReduceMotion(false); setPaused(!(paused || reduceMotion)); }} style={styles.control}><Text style={styles.controlText}>{paused || reduceMotion ? '▶' : 'Ⅱ'}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Previous banner" onPress={() => changeSlide(active - 1)} style={styles.control}><Text style={styles.controlText}>←</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next banner" onPress={() => changeSlide(active + 1)} style={styles.control}><Text style={styles.controlText}>→</Text></Pressable></View></View>
  </View>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, overflow: 'hidden' }, main: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 60, paddingTop: 34, paddingBottom: 12, minHeight: 390, gap: 24 }, mainCompact: { flexDirection: 'column', paddingHorizontal: 24, paddingTop: 32, gap: 0 }, copy: { flex: 1, alignSelf: 'stretch', justifyContent: 'center', paddingVertical: 10 }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 49, lineHeight: 55, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.7, marginTop: 18 }, titleCompact: { fontSize: 35, lineHeight: 40, letterSpacing: -1 }, subtitle: { fontSize: 16, lineHeight: 25, color: '#D9E6F2', maxWidth: 380, marginTop: 16 }, button: { backgroundColor: '#FFFFFF', paddingHorizontal: 22, minHeight: 48, borderRadius: 9, justifyContent: 'center', alignSelf: 'flex-start', marginTop: 26 }, buttonText: { color: '#182D45', fontSize: 14, fontWeight: '800' }, art: { flex: 0.9, height: 335, minWidth: 0, alignItems: 'center', justifyContent: 'center' }, artCompact: { flex: undefined, width: '100%', height: 235 }, artBackdrop: { position: 'absolute', width: '85%', height: '85%', borderRadius: 180, opacity: 0.14 }, productImage: { width: '100%', height: '100%' }, offer: { position: 'absolute', right: 0, top: 8, backgroundColor: '#FFF0DC', borderRadius: 70, width: 132, height: 132, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '8deg' }], padding: 10 }, offerSmall: { color: '#694323', fontSize: 10, fontWeight: '800', textAlign: 'center' }, offerLarge: { color: '#9C421D', fontSize: 43, fontWeight: '900', letterSpacing: -2, marginVertical: 2 }, controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 18, gap: 10 }, pagination: { flexDirection: 'row' }, dotHit: { minWidth: 24, minHeight: 44, justifyContent: 'center', alignItems: 'center' }, dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#8597A8' }, activeDot: { width: 22, backgroundColor: '#FFFFFF' }, controlButtons: { flexDirection: 'row', alignItems: 'center', gap: 6 }, counter: { color: '#D2DEEA', fontSize: 12, marginRight: 8 }, control: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#8091A2', alignItems: 'center', justifyContent: 'center' }, controlText: { color: '#FFFFFF', fontSize: 17 },
});
