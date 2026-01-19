import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingsApi, chatApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Calendar, Clock, MapPin, ChevronRight, Briefcase, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function BookingsScreen() {
    const { token, user } = useAuthStore();
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = useCallback(async () => {
        try {
            if (!token) return;
            const response = await bookingsApi.findAll(token as string);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={styles.loader} />
                ) : !Array.isArray(bookings) || bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Calendar size={60} color={COLORS.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptySubtitle}>All your scheduled services will appear here.</Text>
                        <Button
                            title="Find Services"
                            style={styles.emptyButton}
                            onPress={() => router.push('/(tabs)')}
                        />
                    </View>
                ) : (
                    bookings.map((booking: any) => (
                        <Card key={booking.id || booking._id} style={styles.bookingCard}>
                            <View style={styles.bookingHeader}>
                                <View style={styles.providerInfo}>
                                    <View style={styles.providerAvatar}>
                                        <Text style={styles.avatarText}>
                                            {booking.serviceId?.providerId?.name?.[0] || 'P'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.providerName}>{booking.serviceId?.providerId?.name || 'Provider'}</Text>
                                        <Text style={styles.categoryName}>{booking.serviceId?.categoryId?.name || 'Service'}</Text>
                                    </View>
                                </View>
                                <StatusBadge status={booking.status} />
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.bookingDetails}>
                                <View style={styles.detailRow}>
                                    <Clock size={16} color={COLORS.textMuted} />
                                    <Text style={styles.detailText}>
                                        {new Date(booking.date).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                                <View style={[styles.detailRow, { marginTop: 8 }]}>
                                    <MapPin size={16} color={COLORS.textMuted} />
                                    <Text style={styles.detailText} numberOfLines={1}>{booking.address || 'Service Address'}</Text>
                                </View>
                            </View>

                            <View style={styles.bookingFooter}>
                                <Text style={styles.priceText}>Total: <Text style={styles.priceValue}>${booking.totalAmount}</Text></Text>
                                <View style={styles.footerActions}>
                                    <TouchableOpacity
                                        style={styles.chatButton}
                                        onPress={async () => {
                                            try {
                                                const isProvider = user?.role === 'PROVIDER';
                                                const targetId = isProvider
                                                    ? (booking.customerId?._id || booking.customerId?.id)
                                                    : (booking.serviceId?.providerId?._id || booking.serviceId?.providerId?.id);

                                                if (!targetId || !token) return;
                                                
                                                if (targetId === user?.id) return;

                                                const response = await chatApi.initiateChat(targetId, token);
                                                router.push(`/chat/${response.data._id}` as any);
                                            } catch (error) {
                                                console.error('Error initiating chat:', error);
                                            }
                                        }}
                                    >
                                        <MessageSquare size={20} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <Button
                                        title="Details"
                                        variant="outline"
                                        size="sm"
                                        style={styles.detailsBtn}
                                        onPress={() => router.push(`/booking-details/${booking._id || booking.id}` as any)}
                                    />
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    loader: {
        marginTop: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.surfaceSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    emptySubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    emptyButton: {
        marginTop: SPACING.xxl,
        width: '100%',
    },
    bookingCard: {
        marginBottom: SPACING.lg,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    providerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerAvatar: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    categoryName: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.md,
    },
    bookingDetails: {
        marginBottom: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 8,
        fontWeight: '500',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    priceText: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    footerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatButton: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    detailsBtn: {
        width: 80,
    },
});

const StatusBadge = ({ status }: { status: string }) => {
    const getStyles = () => {
        switch (status) {
            case 'PENDING': return { bg: COLORS.warning + '15', text: COLORS.warning };
            case 'CONFIRMED': return { bg: COLORS.primary + '15', text: COLORS.primary };
            case 'COMPLETED': return { bg: COLORS.success + '15', text: COLORS.success };
            case 'CANCELLED': return { bg: COLORS.error + '15', text: COLORS.error };
            default: return { bg: COLORS.surfaceSubtle, text: COLORS.textMuted };
        }
    };
    const colors = getStyles();
    return (
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
        </View>
    );
};
