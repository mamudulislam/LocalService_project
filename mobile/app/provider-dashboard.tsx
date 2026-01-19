import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Calendar, CheckCircle, Clock, ChevronRight, Settings, Plus, Briefcase, TrendingUp, DollarSign, MessageSquare } from 'lucide-react-native';
import { bookingsApi, chatApi } from '../src/services/api';
import { useAuthStore } from '../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProviderDashboard() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
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
            console.error('Error fetching provider bookings:', error);
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

    const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
        try {
            setLoading(true);
            await bookingsApi.updateStatus(bookingId, newStatus, token!);
            Alert.alert('Status Updated', `Booking has been marked as ${newStatus}.`);
            fetchBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
            Alert.alert('Error', 'Failed to update booking status.');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Jobs', value: bookings.length.toString(), icon: Briefcase, color: COLORS.primary },
        { label: 'Rating', value: '4.9', icon: TrendingUp, color: COLORS.warning },
        { label: 'Earnings', value: `$${bookings.reduce((acc, b: any) => acc + (b.status === 'COMPLETED' ? b.totalAmount : 0), 0)}`, icon: DollarSign, color: COLORS.success },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome Back,</Text>
                        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Provider'} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/(tabs)/profile')}>
                        <Settings size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, idx) => (
                        <Card key={idx} glassy style={styles.statCard}>
                            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manage Your Business</Text>
                    <Card style={styles.actionCard}>
                        <View style={styles.actionInfo}>
                            <View style={styles.actionTextContainer}>
                                <Text style={styles.actionTitle}>Service Offerings</Text>
                                <Text style={styles.actionSubtitle}>Setup your services and pricing</Text>
                            </View>
                            <Button
                                title="Manage"
                                size="sm"
                                style={styles.manageButton}
                                onPress={() => router.push('/manage-services')}
                            />
                        </View>
                    </Card>
                </View>

                {/* Recent Bookings */}
                <View style={[styles.section, { flex: 1 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Bookings</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && !refreshing ? (
                        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
                    ) : bookings.length === 0 ? (
                        <Card glassy style={styles.emptyCard}>
                            <Calendar size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No bookings yet. Keep your services updated to attract customers!</Text>
                        </Card>
                    ) : (
                        bookings.map((booking: any) => (
                            <Card
                                key={booking.id || booking._id}
                                style={styles.bookingCard}
                                onPress={() => router.push(`/booking-details/${booking._id || booking.id}` as any)}
                            >
                                <View style={styles.bookingHeader}>
                                    <View style={styles.customerInfo}>
                                        <View style={styles.avatarSmall}>
                                            <Text style={styles.avatarTextSmall}>{booking.customerId?.name?.[0] || 'C'}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.customerName}>{booking.customerId?.name || 'Customer'}</Text>
                                            <Text style={styles.bookingCategory}>{booking.serviceId?.categoryId?.name || 'Home Service'}</Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                booking.status === 'PENDING' ? COLORS.warning + '15' :
                                                    booking.status === 'CONFIRMED' ? COLORS.primary + '15' :
                                                        booking.status === 'COMPLETED' ? COLORS.success + '15' :
                                                            COLORS.surfaceSubtle
                                        }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    booking.status === 'PENDING' ? COLORS.warning :
                                                        booking.status === 'CONFIRMED' ? COLORS.primary :
                                                            booking.status === 'COMPLETED' ? COLORS.success :
                                                                COLORS.textMuted
                                            }
                                        ]}>{booking.status}</Text>
                                    </View>
                                </View>

                                {booking.status === 'PENDING' && (
                                    <View style={styles.actionRow}>
                                        <Button
                                            title="Reject"
                                            variant="danger"
                                            size="sm"
                                            style={styles.actionBtn}
                                            onPress={() => handleUpdateStatus(booking._id || booking.id, 'CANCELLED')}
                                        />
                                        <View style={{ width: SPACING.md }} />
                                        <Button
                                            title="Accept"
                                            size="sm"
                                            style={styles.actionBtn}
                                            onPress={() => handleUpdateStatus(booking._id || booking.id, 'CONFIRMED')}
                                        />
                                    </View>
                                )}

                                {booking.status === 'CONFIRMED' && (
                                    <View style={styles.actionRow}>
                                        <Button
                                            title="Mark as Completed"
                                            size="sm"
                                            style={styles.fullActionBtn}
                                            onPress={() => handleUpdateStatus(booking._id || booking.id, 'COMPLETED')}
                                        />
                                    </View>
                                )}
                                <View style={styles.bookingFooter}>
                                    <View style={styles.dateRow}>
                                        <Clock size={14} color={COLORS.textMuted} />
                                        <Text style={styles.dateText}>{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor: COLORS.primarySubtle,
                                                borderRadius: RADIUS.sm,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12
                                            }}
                                            onPress={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    const targetId = booking.customerId?._id || booking.customerId?.id;
                                                    if (!targetId || !token) return;
                                                    const response = await chatApi.initiateChat(targetId, token);
                                                    router.push(`/chat/${response.data._id}` as any);
                                                } catch (err) { console.error(err); }
                                            }}
                                        >
                                            <MessageSquare size={18} color={COLORS.primary} />
                                        </TouchableOpacity>

                                        <View style={styles.priceRow}>
                                            <Text style={styles.priceValueSmall}>${booking.totalAmount}</Text>
                                            <ChevronRight size={18} color={COLORS.textMuted} />
                                        </View>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Back to Home Button */}
            <View style={styles.floatingButtonContainer}>
                <Button
                    title="Switch to Customer"
                    variant="outline"
                    onPress={() => router.replace('/(tabs)')}
                    style={styles.switchButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: '31%',
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    section: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    actionCard: {
        padding: SPACING.md,
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    actionSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    manageButton: {
        width: 100,
        height: 40,
    },
    bookingCard: {
        marginBottom: SPACING.md,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    avatarTextSmall: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    bookingCategory: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    actionRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    actionBtn: {
        flex: 1,
        height: 40,
    },
    fullActionBtn: {
        width: '100%',
        height: 40,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: SPACING.md,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginLeft: 6,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceValueSmall: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginRight: 4,
    },
    emptyCard: {
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
        lineHeight: 20,
    },
    loader: {
        padding: SPACING.xxl,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: SPACING.lg,
        left: SPACING.lg,
        right: SPACING.lg,
        ...SHADOWS.md,
    },
    switchButton: {
        backgroundColor: 'white',
        borderColor: COLORS.primary,
        height: 56,
    },
});
