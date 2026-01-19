import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, Briefcase, AlertCircle, ArrowRight } from 'lucide-react-native';
import { authApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await authApi.register({ name, email, password, role });
            const { access_token, user } = response.data;
            setAuth(access_token, user);
            router.replace('/(tabs)');
        } catch (err: any) {
            console.error('Register error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our community of premium local services</Text>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <AlertCircle size={20} color={COLORS.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.roleSelector}>
                        <TouchableOpacity
                            onPress={() => setRole('CUSTOMER')}
                            style={[
                                styles.roleOption,
                                role === 'CUSTOMER' && styles.roleOptionActive,
                                role === 'CUSTOMER' && SHADOWS.sm,
                            ]}
                        >
                            <User size={20} color={role === 'CUSTOMER' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[styles.roleText, role === 'CUSTOMER' && styles.roleTextActive]}>Customer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setRole('PROVIDER')}
                            style={[
                                styles.roleOption,
                                role === 'PROVIDER' && styles.roleOptionActive,
                                role === 'PROVIDER' && SHADOWS.sm,
                            ]}
                        >
                            <Briefcase size={20} color={role === 'PROVIDER' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[styles.roleText, role === 'PROVIDER' && styles.roleTextActive]}>Provider</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            icon={<User size={20} color={COLORS.textMuted} />}
                        />

                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            icon={<Mail size={20} color={COLORS.textMuted} />}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={COLORS.textMuted} />}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerButton}
                            icon={<ArrowRight size={20} color="white" />}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signInText}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
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
    header: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    errorContainer: {
        backgroundColor: '#fff1f2',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: '#fecdd3',
    },
    errorText: {
        color: COLORS.error,
        marginLeft: SPACING.sm,
        flex: 1,
        fontWeight: '500',
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceSubtle,
        borderRadius: RADIUS.lg,
        padding: 6,
        marginBottom: SPACING.xl,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: RADIUS.md,
    },
    roleOptionActive: {
        backgroundColor: COLORS.surface,
    },
    roleText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginLeft: SPACING.sm,
    },
    roleTextActive: {
        color: COLORS.primary,
    },
    form: {
        width: '100%',
    },
    registerButton: {
        marginTop: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xxl,
        paddingBottom: SPACING.xl,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    signInText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 15,
    },
});
