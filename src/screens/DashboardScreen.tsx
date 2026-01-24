
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ---------- Mock Data ----------
type Promo = {
  id: string;
  title: string;
  subtitle?: string;
  cta: string;
  color: string;
  textColor?: string;
};

type Category = {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  discountPct?: number;
  image: string;
};

const PROMOS: Promo[] = [
  {
    id: 'p1',
    title: '20% OFF DURING THE WEEKEND',
    cta: 'Get Now',
    color: '#F1723A', // orange
    textColor: '#fff',
  },
  {
    id: 'p2',
    title: '20% OFF DURING THE WEEKEND',
    cta: 'Get Now',
    color: '#2E7CF6', // blue (secondary card in your mock)
    textColor: '#fff',
  },
];

const CATEGORIES: Category[] = [
  { id: 'c1', label: 'Phones', icon: 'cellphone' },
  { id: 'c2', label: 'Fashion', icon: 'tshirt-crew' },
  { id: 'c3', label: 'Bags', icon: 'bag-personal' },
  { id: 'c4', label: 'Shoes', icon: 'shoe-sneaker' },
  { id: 'c5', label: 'Groceries', icon: 'cart-variant' },
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Redmi Note 4',
    price: 45000,
    oldPrice: 55000,
    discountPct: 50,
    image:
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Apple Watch - series 6',
    price: 45000,
    oldPrice: 65000,
    discountPct: 50,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Analog Watch',
    price: 41000,
    oldPrice: 52000,
    discountPct: 50,
    image:
      'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Casio Classic',
    price: 38000,
    oldPrice: 50000,
    discountPct: 50,
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop',
  },
];

// Utility: format currency (₦)
const formatNaira = (value: number) =>
  `₦ ${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

// For 2-column grid layout
const { width } = Dimensions.get('window');
const GRID_GAP = 16;
const CARD_H_MARGIN = 8;
const COLS = 2;
const CARD_WIDTH = Math.floor((width - GRID_GAP * (COLS + 1)) / COLS);

// ---------- Screen ----------
const DashboardScreen: React.FC = () => {
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  const toggleFav = (id: string) =>
    setFavs((prev) => ({ ...prev, [id]: !prev[id] }));

  const keyExtractor = (item: Product) => item.id;

  const productCardWidth = useMemo(() => {
    // On very wide web screens, clamp to a reasonable width
    const max = 360;
    const min = 160;
    return Math.max(min, Math.min(CARD_WIDTH, max));
  }, []);

  const renderProduct = ({ item }: { item: Product }) => {
    const isFav = !!favs[item.id];

    return (
      <View
        style={[
          styles.productCard,
          {
            width: productCardWidth,
          },
        ]}
      >
        {/* Discount pill */}
        {typeof item.discountPct === 'number' && (
          <View style={styles.discountPill}>
            <Text style={styles.discountText}>{item.discountPct}% OFF</Text>
          </View>
        )}

        {/* Wishlist heart */}
        <Pressable
          onPress={() => toggleFav(item.id)}
          style={({ pressed }) => [
            styles.heartBtn,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#FF4D4F' : '#B9BDC7'}
          />
        </Pressable>

        {/* Product image */}
        <View style={styles.productImageWrap}>
          <Image
            source={{ uri: item.image }}
            resizeMode="contain" // (prop, not style) => avoids RN Web warning
            style={styles.productImage}
          />
        </View>

        {/* Title */}
        <Text numberOfLines={2} style={styles.productTitle}>
          {item.title}
        </Text>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{formatNaira(item.price)}</Text>
          {item.oldPrice ? (
            <Text style={styles.oldPriceText}>{formatNaira(item.oldPrice)}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Help touch handling on web
        style={Platform.select({ web: { touchAction: 'manipulation' as any } })}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="menu" size={22} color="#111827" />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="search" size={22} color="#111827" />
          </Pressable>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.helloText}>
            Hello Fola <Text style={{ fontSize: 20 }}>👋</Text>
          </Text>
          <Text style={styles.subHello}>Let’s start shopping!</Text>
        </View>

        {/* Promo cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoRow}
        >
          {PROMOS.map((promo) => (
            <View
              key={promo.id}
              style={[styles.promoCard, { backgroundColor: promo.color }]}
            >
              <Text
                numberOfLines={2}
                style={[
                  styles.promoTitle,
                  { color: promo.textColor ?? '#111827' },
                ]}
              >
                {promo.title}
              </Text>
              <Pressable style={styles.promoCta}>
                <Text style={styles.promoCtaText}>{promo.cta}</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {/* Categories header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {/* Categories row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((c, idx) => {
            const isActive = idx === 0; // highlight first (as in mock)
            return (
              <View
                key={c.id}
                style={[
                  styles.categoryBox,
                  isActive && { backgroundColor: '#F1723A' },
                ]}
              >
                <MaterialCommunityIcons
                  name={c.icon}
                  size={22}
                  color={isActive ? '#fff' : '#111827'}
                />
              </View>
            );
          })}
        </ScrollView>

        {/* Product grid */}
        <FlatList
          data={PRODUCTS}
          keyExtractor={keyExtractor}
          numColumns={2}
          scrollEnabled={false}
          renderItem={renderProduct}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// ---------- Styles ----------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greeting: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  helloText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subHello: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },

  promoRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  promoCard: {
    width: 260,
    minHeight: 120,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    marginRight: 6,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  promoCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoCtaText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 13,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  seeAll: {
    color: '#F1723A',
    fontWeight: '600',
  },

  categoriesRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  categoryBox: {
    height: 56,
    width: 56,
    borderRadius: 12,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: CARD_H_MARGIN,
    // soft shadow cross‑platform
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    position: 'relative',
  },
  discountPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#F7F7F9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  productImageWrap: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    height: 110,
    width: '100%',
  },
  productTitle: {
    marginTop: 6,
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  oldPriceText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
});