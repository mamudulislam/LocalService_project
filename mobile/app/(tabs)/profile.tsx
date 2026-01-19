import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { User, Settings, LogOut, ChevronRight, Bell, Shield, CreditCard, Briefcase } from 'lucide-react-native';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { authApi } from '../../src/services/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { user, token, setAuth, logout } = useAuthStore();
    const router = useRouter();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    const handleEditProfile = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const res = await authApi.updateProfile(formData, token!);
            // The API returns the updated user object directly or in data depending on interceptor
            // Based on service code: return { id, ... }
            const updatedUser = res.data || res;
            setAuth(token!, { ...user, ...updatedUser });
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    const MenuItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Icon size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>
                            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '??'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>

                    <View style={styles.badgeContainer}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{user?.role || 'CUSTOMER'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <Card style={styles.menuCard} padded={false}>
                        <MenuItem
                            icon={User}
                            title="Personal Information"
                            subtitle="Name, email, phone number"
                            onPress={handleEditProfile}
                        />
                        {user?.role === 'PROVIDER' && (
                            <>
                                <View style={styles.divider} />
                                <MenuItem
                                    icon={Briefcase}
                                    title="Provider Dashboard"
                                    subtitle="Manage your services and jobs"
                                    onPress={() => router.push('/provider-dashboard')}
                                />
                            </>
                        )}
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <Card style={styles.menuCard} padded={false}>
                        <MenuItem
                            icon={LogOut}
                            title="Log Out"
                            onPress={handleLogout}
                        />
                    </Card>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

                <Modal
                    visible={editModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Profile</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                    <Text style={styles.modalCancel}>Cancel</Text>
                                </TouchableOpacity>
                            </View>

                            <Input
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                            <Input
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Input
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                keyboardType="phone-pad"
                            />

                            <Button
                                title={loading ? "Saving..." : "Save Changes"}
                                onPress={handleSaveProfile}
                                loading={loading}
                                style={{ marginTop: SPACING.lg }}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
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
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    avatarTextLarge: {
        fontSize: 36,
        fontWeight: '800',
        color: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    badgeContainer: {
        marginTop: SPACING.md,
    },
    badge: {
        backgroundColor: COLORS.primarySubtle,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    badgeText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
    menuCard: {
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surfaceSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xxl,
    },
    versionText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
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
    modalCancel: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
});
