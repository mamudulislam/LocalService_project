import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { Search, MapPin, Star, ChevronRight, Bell, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { categoriesApi, servicesApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Detecting location...');

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location disabled');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const city = item.city || item.district || item.subregion;
        const country = item.country;
        setLocationName(city ? `${city}, ${country}` : country || 'Unknown location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationName('Location unavailable');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, serRes] = await Promise.all([
        categoriesApi.findAll(),
        servicesApi.findAll(),
      ]);
      setCategories(catRes.data);
      setServices(serRes.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.headerLabel}>Location</Text>
              <TouchableOpacity style={styles.locationSelector} onPress={getUserLocation}>
                <MapPin size={14} color={COLORS.primary} />
                <Text style={styles.locationText}>{locationName}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={22} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '??'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</Text>
          <Text style={styles.headline}>Find the best service for your home</Text>
        </View>

        {/* Sticky Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Search size={20} color={COLORS.textMuted} />
            <TextInput
              placeholder="Search for handymen, cleaners..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.filterButton}>
              <SlidersHorizontal size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.sectionLink}>View Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : (
              categories.map((cat: any) => (
                <TouchableOpacity key={cat._id || cat.id} style={styles.categoryItem}>
                  <Card glassy style={styles.categoryCard} padded={false}>
                    <Text style={styles.categoryIcon}>{cat.icon || '🛠️'}</Text>
                  </Card>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Specialists</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : (
            services.map((service: any) => (
              <Card
                key={service.id || service._id}
                style={styles.serviceCard}
                onPress={() => router.push({ pathname: '/service-details', params: { id: service.id || service._id } })}
              >
                <View style={styles.serviceRow}>
                  <View style={styles.serviceImagePlaceholder}>
                    <Text style={styles.serviceInitial}>{service.provider?.name?.[0]}</Text>
                  </View>

                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceCategory}>{service.category?.name || 'Category'}</Text>
                    <Text style={styles.serviceTitle}>{service.provider?.name || 'Provider'}</Text>

                    <View style={styles.ratingRow}>
                      <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                      <Text style={styles.ratingText}>4.9</Text>
                      <Text style={styles.reviewCount}>(120+ reviews)</Text>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>${service.price}</Text>
                    <Text style={styles.priceUnit}>/hr</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
    lineHeight: 34,
  },
  searchContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: RADIUS.lg,
    paddingLeft: SPACING.md,
    height: 56,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  categoryItem: {
    width: (width - SPACING.lg * 2) / 4,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  categoryCard: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loader: {
    marginVertical: SPACING.xl,
    width: '100%',
  },
  serviceCard: {
    marginBottom: SPACING.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  serviceCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
