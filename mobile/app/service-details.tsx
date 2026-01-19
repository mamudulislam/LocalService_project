import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, MapPin, Clock, Phone, ChevronLeft, ShieldCheck, Heart, Mail } from 'lucide-react-native';
import { servicesApi, bookingsApi } from '../src/services/api';
import { useAuthStore } from '../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Input } from '../src/components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, TextInput } from 'react-native';

const { width } = Dimensions.get('window');

export default function ServiceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Booking Modal State
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [locationDetails, setLocationDetails] = useState('');

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            setLoading(true);
            const response = await servicesApi.findOne(id as string);
            setService(response.data);
        } catch (error) {
            console.error('Error fetching service:', error);
            Alert.alert('Error', 'Could not load service details.');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!token) {
            Alert.alert('Login Required', 'Please login to book a service.', [
                { text: 'Cancel' },
                { text: 'Login', onPress: () => router.push('/(auth)/login' as any) }
            ]);
            return;
        }

        const user = useAuthStore.getState().user;
        if (user?.role === 'PROVIDER') {
            Alert.alert('Not Allowed', 'As a provider, you cannot book services. Please list your own services instead!');
            return;
        }

        setBookingModalVisible(true);
    };


    const confirmBooking = async () => {
        if (!clientName || !clientAddress || !clientEmail || !clientPhone) {
            Alert.alert('Missing Info', 'Please fill in all required client details.');
            return;
        }

        try {
            setBookingLoading(true);
            const bookingData = {
                serviceId: id,
                date: new Date().toISOString(),
                address: clientAddress,
                clientName,
                clientEmail,
                clientPhone,
                locationDetails,
                totalAmount: service.price,
            };
            await bookingsApi.create(bookingData, token || '');
            setBookingModalVisible(false);
            Alert.alert('Success', 'Booking request sent successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!service) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Header */}
                <View style={styles.heroContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>
                            {service.category?.name?.[0] || '🛠️'}
                        </Text>
                    </View>

                    <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconButton}
                        >
                            <ChevronLeft size={24} color={COLORS.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsFavorite(!isFavorite)}
                            style={styles.iconButton}
                        >
                            <Heart
                                size={24}
                                color={isFavorite ? COLORS.accent : COLORS.text}
                                fill={isFavorite ? COLORS.accent : 'transparent'}
                            />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{service.category?.name}</Text>
                        </View>
                        <Text style={styles.providerName}>{service.provider?.name}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.ratingBox}>
                                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                                <Text style={styles.ratingValue}>4.9</Text>
                                <Text style={styles.reviewCount}>(124 reviews)</Text>
                            </View>
                            <View style={styles.metaSeparator} />
                            <View style={styles.locationBox}>
                                <MapPin size={16} color={COLORS.primary} />
                                <Text style={styles.locationText}>2.5 miles away</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            {service.description || service.provider?.bio || 'Highly skilled professional providing top-quality services with over 5 years of experience in the field.'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact & Location</Text>
                        <Card glassy style={styles.contactCard}>
                            <View style={styles.contactRow}>
                                <MapPin size={18} color={COLORS.primary} />
                                <Text style={styles.contactText}>{service.location || 'Location not specified'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.contactRow}>
                                <Phone size={18} color={COLORS.primary} />
                                <Text style={styles.contactText}>{service.phone || 'Phone not specified'}</Text>
                            </View>
                            <View style={styles.contactRow}>
                                <Mail size={18} color={COLORS.primary} />
                                <Text style={styles.contactText}>{service.email || 'Email not specified'}</Text>
                            </View>
                        </Card>
                    </View>

                    <View style={styles.featuresRow}>
                        <Card glassy style={styles.featureCard}>
                            <ShieldCheck size={20} color={COLORS.primary} />
                            <Text style={styles.featureLabel}>Verified</Text>
                        </Card>
                        <Card glassy style={styles.featureCard}>
                            <Clock size={20} color={COLORS.primary} />
                            <Text style={styles.featureLabel}>Quick Response</Text>
                        </Card>
                        <Card glassy style={styles.featureCard}>
                            <Star size={20} color={COLORS.primary} />
                            <Text style={styles.featureLabel}>Top Rated</Text>
                        </Card>
                    </View>

                    <View style={styles.contactActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.actionIconContainer}>
                                <Phone size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <SafeAreaView style={styles.footer} edges={['bottom']}>
                <View style={styles.footerContent}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Price</Text>
                        <Text style={styles.priceValue}>${service.price}<Text style={styles.priceUnit}>/hr</Text></Text>
                    </View>
                    <Button
                        title={bookingLoading ? 'Booking...' : 'Book Now'}
                        loading={bookingLoading}
                        onPress={handleBook}
                        style={styles.bookButton}
                    />
                </View>
            </SafeAreaView>

            {/* Booking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={bookingModalVisible}
                onRequestClose={() => setBookingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirm Booking</Text>
                            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                            <Input
                                label="Your Name"
                                placeholder="Enter your full name"
                                value={clientName}
                                onChangeText={setClientName}
                            />

                            <Input
                                label="Service Address"
                                placeholder="Where should the service be provided?"
                                value={clientAddress}
                                onChangeText={setClientAddress}
                                icon={<MapPin size={20} color={COLORS.textMuted} />}
                            />

                            <Input
                                label="Contact Email"
                                placeholder="Your email address"
                                value={clientEmail}
                                onChangeText={setClientEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Phone Number"
                                placeholder="Your contact number"
                                value={clientPhone}
                                onChangeText={setClientPhone}
                                keyboardType="phone-pad"
                            />

                            <Input
                                label="Location Details (Optional)"
                                placeholder="Apt #, Landmark, etc."
                                value={locationDetails}
                                onChangeText={setLocationDetails}
                                multiline
                                numberOfLines={2}
                            />

                            <View style={styles.paymentPreview}>
                                <Text style={styles.paymentPreviewLabel}>Amount to pay</Text>
                                <Text style={styles.paymentPreviewValue}>${service.price}</Text>
                            </View>

                            <Button
                                title={bookingLoading ? "Processing..." : "Confirm Booking"}
                                loading={bookingLoading}
                                onPress={confirmBooking}
                                style={styles.submitButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    heroContainer: {
        width: '100%',
        height: 300,
        backgroundColor: COLORS.surfaceSubtle,
        position: 'relative',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primarySubtle,
    },
    imagePlaceholderText: {
        fontSize: 80,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'android' ? SPACING.xl : 0,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    content: {
        flex: 1,
        marginTop: -RADIUS.xl,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        paddingTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    mainInfo: {
        marginBottom: SPACING.xl,
    },
    categoryBadge: {
        backgroundColor: COLORS.primarySubtle,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    categoryBadgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    providerName: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    metaSeparator: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginLeft: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    featureCard: {
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    featureLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    contactActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        marginHorizontal: 4,
        ...SHADOWS.sm,
    },
    actionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.lg,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
    },
    priceUnit: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    bookButton: {
        flex: 1.5,
        marginLeft: SPACING.lg,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    modalForm: {
        width: '100%',
    },
    submitButton: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    paymentPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surfaceSubtle,
        borderRadius: RADIUS.md,
        marginTop: SPACING.md,
    },
    paymentPreviewLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    paymentPreviewValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    contactCard: {
        padding: SPACING.md,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 4,
    },
});
