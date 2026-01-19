import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Lock, CheckCircle } from 'lucide-react-native';
import { authApi } from '../../src/services/api';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await authApi.resetPasswordDirect({ email, newPassword });
            setResetSuccess(true);
        } catch (error: any) {
            console.error('Reset password error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to reset password. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    if (resetSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <CheckCircle size={64} color={COLORS.success} />
                    </View>
                    <Text style={styles.successTitle}>Password Reset!</Text>
                    <Text style={styles.successMessage}>
                        Your password has been successfully reset.
                    </Text>
                    <Text style={styles.successSubtext}>
                        You can now login with your new password.
                    </Text>
                    <Button
                        title="Back to Login"
                        onPress={() => router.replace('/(auth)/login')}
                        style={styles.backToLoginButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            Enter your email and new password to reset your account password.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            icon={<Mail size={20} color={COLORS.textMuted} />}
                        />

                        <Input
                            label="New Password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={COLORS.textMuted} />}
                        />

                        <Input
                            label="Confirm New Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={COLORS.textMuted} />}
                        />

                        <Button
                            title="Reset Password"
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.submitButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.loginText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    header: {
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    submitButton: {
        marginTop: SPACING.xl,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    loginText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 15,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    successIcon: {
        marginBottom: SPACING.xl,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.sm,
    },
    successSubtext: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
        lineHeight: 20,
    },
    backToLoginButton: {
        minWidth: 200,
    },
});
