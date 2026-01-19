import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet, Platform, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Search, ChevronLeft, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { servicesApi } from '../../src/services/api';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';

export default function ExploreScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const mapRef = React.useRef<MapView>(null);
    const scrollRef = React.useRef<ScrollView>(null);

    const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
        { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
    ];

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            // Animate map to current location
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            }

            fetchNearbyProviders(loc.coords.latitude, loc.coords.longitude);
        })();
    }, []);

    const fetchNearbyProviders = async (lat: number, lng: number) => {
        try {
            setLoading(true);
            const params: any = { radius: 10 };
            if (lat != null) params.lat = Number(lat);
            if (lng != null) params.lng = Number(lng);

            const response = await servicesApi.findAll(params);
            setProviders(response.data);
            setFilteredProviders(response.data);
        } catch (error: any) {
            console.error('Error fetching providers:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        const filtered = providers.filter((p: any) =>
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.category?.name?.toLowerCase().includes(lowerQuery) ||
            p.provider?.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)
        );
        setFilteredProviders(filtered);
    };

    const centerOnUser = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.content}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    customMapStyle={mapStyle}
                    initialRegion={{
                        latitude: location?.coords.latitude || 37.78825,
                        longitude: location?.coords.longitude || -122.4324,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    showsUserLocation
                    showsMyLocationButton={false}
                    onPress={() => setSelectedService(null)}
                >
                    {filteredProviders.filter((s: any) => s.locationLat != null && s.locationLng != null).map((service: any) => {
                        const sId = service._id || service.id;
                        const isSelected = selectedService?._id === sId || selectedService?.id === sId;
                        return (
                            <Marker
                                key={sId}
                                coordinate={{
                                    latitude: service.locationLat,
                                    longitude: service.locationLng
                                }}
                                onPress={() => {
                                    setSelectedService(service);
                                    // Scroll carousel to this item
                                    const index = filteredProviders.findIndex((p: any) => (p._id || p.id) === sId);
                                    if (index !== -1 && scrollRef.current) {
                                        scrollRef.current.scrollTo({ x: index * (width * 0.8), animated: true });
                                    }
                                }}
                            >
                                <View style={[
                                    styles.markerWrapper,
                                    isSelected && styles.markerWrapperActive
                                ]}>
                                    <View style={[styles.markerBubble, isSelected && styles.markerBubbleActive]}>
                                        <Text style={[styles.markerPrice, isSelected && styles.markerPriceActive]}>${service.price}</Text>
                                    </View>
                                    <View style={[styles.markerArrow, isSelected && styles.markerArrowActive]} />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                {/* Floating UI Elements */}
                <View style={styles.overlay}>
                    <Card style={styles.searchCard} padded={false}>
                        <View style={styles.searchBar}>
                            <Search size={20} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Find experts near you..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>
                    </Card>

                    <TouchableOpacity style={styles.locateBtn} onPress={centerOnUser}>
                        <MapPin size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.carouselContainer}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width * 0.8}
                        decelerationRate="fast"
                        contentContainerStyle={styles.carouselContent}
                    >
                        {filteredProviders.map((service: any) => {
                            const sId = service._id || service.id;
                            const isSelected = (selectedService?._id === sId || selectedService?.id === sId);
                            return (
                                <TouchableOpacity
                                    key={sId}
                                    activeOpacity={0.9}
                                    onPress={() => router.push({ pathname: '/service-details', params: { id: sId } })}
                                >
                                    <Card elevated glassy style={[
                                        styles.previewCard,
                                        isSelected && { borderColor: COLORS.primary, borderWidth: 1.5 }
                                    ]}>
                                        <View style={styles.previewRow}>
                                            <View style={styles.previewIcon}>
                                                <Text style={{ fontSize: 24 }}>{service.category?.icon || '🛠️'}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.previewTitle} numberOfLines={1}>{service.name}</Text>
                                                <View style={styles.previewMeta}>
                                                    <MapPin size={12} color={COLORS.textSecondary} />
                                                    <Text style={styles.previewLocation} numberOfLines={1}>{service.location}</Text>
                                                </View>
                                                <Text style={styles.previewPrice}>${service.price}<Text style={{ fontSize: 10, color: COLORS.textMuted }}>/hr</Text></Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {loading && !location && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerWrapperActive: {
        zIndex: 10,
    },
    markerBubble: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.primary,
        ...SHADOWS.md,
    },
    markerPrice: {
        fontSize: 15,
        fontWeight: '900',
        color: COLORS.text,
    },
    markerArrow: {
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: COLORS.primary,
        transform: [{ rotate: '-45deg' }],
        marginTop: -6,
    },
    overlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: SPACING.lg,
        right: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
    },
    searchCard: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: SPACING.md,
        ...SHADOWS.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        marginLeft: SPACING.sm,
        fontWeight: '600',
    },
    carouselContainer: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: 0,
        right: 0,
    },
    carouselContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    previewCard: {
        width: width * 0.75,
        padding: SPACING.md,
        ...SHADOWS.lg,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    previewIcon: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    previewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    previewLocation: {
        fontSize: 12,
        color: COLORS.textSecondary,
        flex: 1,
    },
    previewPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
        marginTop: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerBubbleActive: {
        backgroundColor: COLORS.primary,
        borderColor: 'white',
        transform: [{ scale: 1.1 }],
    },
    markerPriceActive: {
        color: 'white',
    },
    markerArrowActive: {
        backgroundColor: COLORS.primary,
        borderColor: 'white',
        transform: [{ rotate: '-45deg' }, { scale: 1.1 }],
    },
    locateBtn: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
        ...SHADOWS.lg,
    },
});
