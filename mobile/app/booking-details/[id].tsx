import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Clock, Phone, MessageSquare, DollarSign, User } from 'lucide-react-native';
import { bookingsApi, chatApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isProvider = user?.role === 'PROVIDER';

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingsApi.findOne(id as string, token!);
            setBooking(response.data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Alert.alert('Error', 'Failed to load booking details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            setLoading(true);
            await bookingsApi.updateStatus(id as string, newStatus, token!);
            Alert.alert('Success', `Booking marked as ${newStatus}`);
            fetchBooking();
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update status.');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phone = isProvider ?
            (booking?.clientPhone || booking?.customer?.phone || booking?.customerId?.phone) :
            (booking?.serviceId?.phone || booking?.serviceId?.providerId?.phone);
        if (phone) Linking.openURL(`tel:${phone}`);
        else Alert.alert('Error', 'Phone number not available');
    };

    const handleMessage = async () => {
        const otherUserId = isProvider
            ? (booking.customerId?._id || booking.customer?._id)
            : (booking.serviceId?.providerId?._id || booking.provider?._id || booking.serviceId?.providerId);

        if (!otherUserId) {
            Alert.alert('Error', 'User information missing');
            return;
        }

        try {
            const res = await chatApi.initiateChat(otherUserId, token!);
            const chatId = res.data._id || res.data.id;
            router.push(`/chat/${chatId}`);
        } catch (error) {
            console.error('Error initiating chat:', error);
            Alert.alert('Error', 'Failed to start chat');
        }
    };

    const handleBookAgain = () => {
        if (booking?.serviceId?._id) {
            router.push({
                pathname: '/service-details',
                params: { id: booking.serviceId._id }
            });
        } else {
             Alert.alert('Error', 'Service details not available');
        }
    };

    if (loading && !booking) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.centered}>
                <Text>Booking not found</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status Header */}
                <Card glassy style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>Booking Status</Text>
                            <Text style={[styles.statusValue, {
                                color: booking.status === 'COMPLETED' ? COLORS.success :
                                    booking.status === 'PENDING' ? COLORS.warning :
                                        booking.status === 'CONFIRMED' ? COLORS.primary : COLORS.error
                            }]}>{booking.status}</Text>
                        </View>
                        <Calendar size={24} color={COLORS.textMuted} />
                    </View>
                </Card>

                {/* Service Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <Card style={styles.serviceCard}>
                        <View style={styles.serviceRow}>
                            <View style={styles.iconBox}>
                                <Text style={{ fontSize: 24 }}>{booking.serviceId?.categoryId?.icon || '🛠️'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.serviceName}>{booking.serviceId?.categoryId?.name}</Text>
                                <Text style={styles.serviceDesc}>{booking.serviceId?.description || 'Professional home service'}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Calendar size={18} color={COLORS.primary} />
                                <Text style={styles.infoText}>{new Date(booking.date).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Clock size={18} color={COLORS.primary} />
                                <Text style={styles.infoText}>{new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <Card style={styles.locationCard}>
                        <View style={styles.locationRow}>
                            <MapPin size={20} color={COLORS.error} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.addressText}>{booking.address || 'Location provided on map'}</Text>
                                {booking.locationDetails && (
                                    <Text style={styles.locationDetailText}>{booking.locationDetails}</Text>
                                )}
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Client Details (Visible to Provider) */}
                {isProvider && (booking.clientName || booking.clientPhone || booking.clientEmail) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Client Contact Info</Text>
                        <Card style={styles.profileCard}>
                            <View style={styles.infoRow}>
                                <User size={18} color={COLORS.primary} />
                                <Text style={styles.infoRowText}>{booking.clientName || booking.customer?.name}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Phone size={18} color={COLORS.primary} />
                                <Text style={styles.infoRowText}>{booking.clientPhone || 'No phone provided'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <MessageSquare size={18} color={COLORS.primary} />
                                <Text style={styles.infoRowText}>{booking.clientEmail || 'No email provided'}</Text>
                            </View>
                        </Card>
                    </View>
                )}

                {/* Profile Info (Counterparty) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{isProvider ? 'Customer' : 'Professional'}</Text>
                    <Card style={styles.profileCard}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <User size={24} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.profileName}>{isProvider ? (booking.customerId?.name || booking.customer?.name) : (booking.serviceId?.providerId?.name || booking.provider?.name)}</Text>
                                <Text style={styles.profileMeta}>{isProvider ? 'Member since 2023' : 'Verified Professional'}</Text>
                            </View>
                            <View style={styles.contactActions}>
                                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                    <Phone size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactBtn} onPress={handleMessage}>
                                    <MessageSquare size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Payment Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <Card style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Service Fee</Text>
                            <Text style={styles.paymentValue}>${booking.totalAmount}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${booking.totalAmount}</Text>
                        </View>
                    </Card>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Sticky Actions */}
            <View style={styles.footer}>
                {isProvider ? (
                    <>
                        {booking.status === 'PENDING' && (
                            <View style={styles.footerActions}>
                                <Button
                                    title="Decline"
                                    variant="danger"
                                    style={{ flex: 1 }}
                                    onPress={() => handleUpdateStatus('CANCELLED')}
                                />
                                <View style={{ width: SPACING.md }} />
                                <Button
                                    title="Accept Job"
                                    style={{ flex: 2 }}
                                    onPress={() => handleUpdateStatus('CONFIRMED')}
                                />
                            </View>
                        )}
                        {booking.status === 'CONFIRMED' && (
                            <Button
                                title="Mark as Completed"
                                style={{ width: '100%' }}
                                onPress={() => handleUpdateStatus('COMPLETED')}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {booking.status === 'PENDING' && (
                            <Button
                                title="Cancel Booking"
                                variant="outline"
                                style={{ width: '100%', borderColor: COLORS.error }}
                                textStyle={{ color: COLORS.error }}
                                onPress={() => handleUpdateStatus('CANCELLED')}
                            />
                        )}
                        {booking.status === 'COMPLETED' && (
                            <Button title="Book Again" size="lg" style={{ width: '100%' }} onPress={handleBookAgain} />
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    statusCard: {
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusValue: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    serviceCard: {
        padding: SPACING.md,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    serviceDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.md,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSubtle,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADIUS.sm,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 8,
    },
    locationCard: {
        padding: SPACING.md,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    locationDetailText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoRowText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 12,
        fontWeight: '500',
    },
    profileCard: {
        padding: SPACING.md,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    profileMeta: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    contactActions: {
        flexDirection: 'row',
    },
    contactBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    paymentCard: {
        padding: SPACING.md,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    paymentLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.lg,
    },
    footerActions: {
        flexDirection: 'row',
    },
});
