import type { Banner, Product } from '@sirohi/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
  const [containerWidth, setContainerWidth] = useState(0);
  const compact = containerWidth < 720;
  const small = containerWidth < 400;
  const spacious = containerWidth >= 1100;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const slideCount = customerCollections.length;
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (paused || reduceMotion || hovered) return;
    const timer = setInterval(() => setActive(value => (value + 1) % slideCount), 6500);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, hovered, slideCount]);
  const collection = customerCollections[active];
  const activeBanners = banners.filter(item => item.active && products.some(product => product.id === item.productId));
  const banner = activeBanners[active];
  const linkedProduct = banner ? products.find(product => product.id === banner.productId) : undefined;
  const visualCollection = customerCollections.find(item => item.category === linkedProduct?.category) ?? collection;
  const category = linkedProduct?.category ?? collection.category;
  const offerProducts = linkedProduct ? [linkedProduct] : products.filter(product => product.category === category && product.stock > 0);
  const savings = Math.max(0, ...offerProducts.map(product => product.compareAtPriceInPaise && product.compareAtPriceInPaise > product.priceInPaise ? Math.floor((1 - product.priceInPaise / product.compareAtPriceInPaise) * 100) : 0));
  const imageUrl = banner?.imageUrl || linkedProduct?.imageUrl;
  const [failedImageUrl, setFailedImageUrl] = useState<string>();
  const hasRemoteImage = !!imageUrl && failedImageUrl !== imageUrl;
  const ctaLabel = banner?.ctaLabel || (linkedProduct ? 'View product' : `Shop ${category === 'PVC & Plumbing' ? 'plumbing' : category.toLowerCase()}`);
  function openCollection() { if (linkedProduct) router.push(`/product/${linkedProduct.id}`); else router.push({ pathname: '/catalog', params: { category: collection.category } }); }
  function changeSlide(index: number) { setPaused(true); setActive((index + slideCount) % slideCount); }

  return (
    <View
      onLayout={event => setContainerWidth(Math.round(event.nativeEvent.layout.width))}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={[styles.hero, { backgroundColor: collection.color }, small && styles.heroSmall]}
    >
      <View style={[styles.main, spacious && styles.mainSpacious, compact && styles.mainCompact]}>
        <View style={[styles.copy, compact && styles.copyCompact]}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.eyebrowMark, { backgroundColor: collection.accent }]} />
            <Text style={[styles.eyebrow, { color: collection.accent }]}>{banner?.badge || collection.label}</Text>
          </View>
          <Text accessibilityRole="header" style={[styles.title, spacious && styles.titleSpacious, compact && styles.titleCompact, small && styles.titleSmall]}>
            {banner?.title || collection.title}
          </Text>
          <Text style={styles.subtitle}>{banner?.subtitle || collection.copy}</Text>
          <Pressable
            accessibilityRole="link"
            onFocus={() => setPaused(true)}
            onPress={openCollection}
            style={({ pressed }) => [styles.button, small && styles.buttonSmall, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>{ctaLabel}</Text>
            <Text accessible={false} style={styles.buttonArrow}>↗</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={linkedProduct ? `View ${linkedProduct.name}` : `Explore ${category}`}
          onFocus={() => setPaused(true)}
          onPress={openCollection}
          style={({ pressed }) => [styles.art, compact && styles.artCompact, pressed && styles.pressed]}
        >
          <View style={[styles.artHeader, compact && styles.artHeaderCompact]}>
            <Text style={styles.artLabel}>{linkedProduct ? 'PRODUCT SPOTLIGHT' : 'THE SIROHI COLLECTION'}</Text>
            {savings > 0 ? <View style={styles.offer}><Text style={styles.offerText}>{linkedProduct ? `${savings}% off` : `Up to ${savings}% off`}</Text></View> : null}
          </View>
          <View style={[styles.artBody, compact && styles.artBodyCompact]}>
            <View style={[styles.imageStage, compact && styles.imageStageCompact]}>
              <View style={[styles.artBackdrop, { backgroundColor: collection.accent }, compact && styles.artBackdropCompact]} />
              <Image
                key={imageUrl || category}
                accessible={false}
                source={hasRemoteImage ? { uri: imageUrl } : visualCollection.image}
                onError={() => { if (imageUrl) setFailedImageUrl(imageUrl); }}
                style={[styles.productImage, !hasRemoteImage && styles.localProductImage, compact && styles.productImageCompact, compact && !hasRemoteImage && styles.localProductImageCompact]}
                resizeMode={compact && hasRemoteImage ? 'cover' : 'contain'}
              />
            </View>
            <View style={[styles.artCaption, compact && styles.artCaptionCompact]}>
              <View style={styles.captionCopy}>
                <Text style={[styles.categoryName, compact && small && styles.categoryNameSmall]} numberOfLines={compact ? undefined : 2}>{linkedProduct?.name || category}</Text>
                <Text style={styles.categoryHint}>{linkedProduct ? linkedProduct.brand : 'Explore the collection'}</Text>
              </View>
              {!compact ? <View style={[styles.artArrow, { backgroundColor: collection.color }]}><Text style={styles.artArrowText}>↗</Text></View> : null}
            </View>
          </View>
        </Pressable>
      </View>

      <View style={[styles.controls, compact && styles.controlsCompact, small && styles.controlsSmall]}>
        <View style={styles.pagination}>
          {customerCollections.map((item, index) => (
            <Pressable
              key={item.category}
              accessibilityRole="button"
              accessibilityLabel={`Show banner ${index + 1}: ${activeBanners[index]?.title ?? item.category}`}
              accessibilityState={{ selected: active === index }}
              onFocus={() => setPaused(true)}
              onPress={() => changeSlide(index)}
              style={styles.dotHit}
            >
              <View style={[styles.dot, active === index && styles.activeDot]} />
            </Pressable>
          ))}
        </View>
        {!compact ? <Text style={styles.slideCategory}>{category}</Text> : null}
        <View style={styles.controlButtons}>
          {!compact || small ? <Text style={styles.counter}>{String(active + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused || reduceMotion ? 'Play promotional banners' : 'Pause promotional banners'}
            onPress={() => { setReduceMotion(false); setPaused(!(paused || reduceMotion)); }}
            style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}
          ><Text style={styles.playText}>{paused || reduceMotion ? '▶' : 'Ⅱ'}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous banner" onPress={() => changeSlide(active - 1)} style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}><Text style={styles.controlText}>←</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next banner" onPress={() => changeSlide(active + 1)} style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}><Text style={styles.controlText}>→</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', borderRadius: 24, overflow: 'hidden' },
  heroSmall: { borderRadius: 18 },
  main: { flexDirection: 'row', alignItems: 'center', padding: 32, gap: 28 },
  mainSpacious: { paddingHorizontal: 52, paddingVertical: 40, gap: 56 },
  mainCompact: { flexDirection: 'column', alignItems: 'stretch', padding: 24, gap: 26 },
  copy: { flex: 1.15, minWidth: 0, justifyContent: 'center', paddingVertical: 8 },
  copyCompact: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', paddingVertical: 0 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  eyebrowMark: { width: 7, height: 7, borderRadius: 4 },
  eyebrow: { flexShrink: 1, fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 1.6 },
  title: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.3, marginTop: 18 },
  titleSpacious: { fontSize: 50, lineHeight: 56, letterSpacing: -1.8 },
  titleCompact: { fontSize: 36, lineHeight: 42, letterSpacing: -1.1, marginTop: 14 },
  titleSmall: { fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  subtitle: { fontSize: 16, lineHeight: 25, color: '#E0E8E7', maxWidth: 430, marginTop: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, backgroundColor: '#FFFFFF', paddingHorizontal: 22, paddingVertical: 13, minHeight: 52, borderRadius: 12, alignSelf: 'flex-start', marginTop: 26 },
  buttonSmall: { alignSelf: 'stretch' },
  buttonText: { flexShrink: 1, color: '#182D45', fontSize: 15, lineHeight: 22, fontWeight: '800' },
  buttonArrow: { color: '#182D45', fontSize: 23, lineHeight: 26 },
  art: { flex: 0.85, minWidth: 0, maxWidth: 460, backgroundColor: '#F3F6F2', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  artCompact: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: '100%', maxWidth: '100%', borderRadius: 16 },
  artHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 20, paddingTop: 18, zIndex: 1 },
  artHeaderCompact: { paddingHorizontal: 16, paddingTop: 16 },
  artLabel: { color: '#54655C', fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 1 },
  offer: { backgroundColor: '#DDEEDB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  offerText: { color: '#285032', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  artBody: { width: '100%' },
  artBodyCompact: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  imageStage: { height: 248, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 12 },
  imageStageCompact: { height: 'auto', width: '36%', minWidth: 76, maxWidth: 136, aspectRatio: 1, flexShrink: 0, marginHorizontal: 0, borderRadius: 10, backgroundColor: '#E8EEE8' },
  artBackdrop: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.28 },
  artBackdropCompact: { width: '100%', height: '100%', borderRadius: 10 },
  productImage: { width: '100%', height: '100%' },
  productImageCompact: { borderRadius: 10 },
  // The bundled product illustrations include generous transparent margins.
  localProductImage: { transform: [{ translateY: -18 }, { scale: 1.6 }] },
  localProductImageCompact: { transform: [{ translateY: -10 }, { scale: 1.45 }] },
  artCaption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 20, borderTopWidth: 1, borderColor: '#DCE4DD', backgroundColor: '#FFFFFF' },
  artCaptionCompact: { flex: 1, minWidth: 0, padding: 0, borderTopWidth: 0, backgroundColor: 'transparent' },
  captionCopy: { flex: 1, minWidth: 0 },
  categoryName: { fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.3, color: '#203C32' },
  categoryNameSmall: { fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  categoryHint: { color: '#64736B', fontSize: 13, lineHeight: 19, marginTop: 3 },
  artArrow: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  artArrowText: { color: '#FFFFFF', fontSize: 21 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 14, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 12 },
  controlsCompact: { paddingHorizontal: 24, paddingVertical: 12 },
  controlsSmall: { flexDirection: 'column', gap: 4 },
  pagination: { flexDirection: 'row', alignItems: 'center' },
  dotHit: { width: 26, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  activeDot: { width: 22, backgroundColor: '#FFFFFF' },
  slideCategory: { flex: 1, color: '#E0E8E7', fontSize: 13, lineHeight: 19, marginLeft: 12 },
  controlButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counter: { color: '#E0E8E7', fontSize: 12, fontWeight: '600', marginRight: 8, fontVariant: ['tabular-nums'] },
  control: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  controlText: { color: '#FFFFFF', fontSize: 21 },
  playText: { color: '#FFFFFF', fontSize: 15 },
  controlPressed: { backgroundColor: 'rgba(255,255,255,0.16)' },
  pressed: { opacity: 0.85 },
});
