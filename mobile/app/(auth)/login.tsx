import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react-native';
import { authApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await authApi.login({ email, password });
            const { access_token, user } = response.data;
            setAuth(access_token, user);
            router.replace('/(tabs)');
        } catch (err: any) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                    {/* Decorative Header Background */}
                    <View style={styles.headerDecoration} />

                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <View style={styles.logoInner} />
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to discover and book premium local services</Text>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <AlertCircle size={20} color={COLORS.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

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
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={COLORS.textMuted} />}
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push('/(auth)/forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                            icon={<ArrowRight size={20} color="white" />}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signUpText}>Sign Up</Text>
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
    headerDecoration: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.primaryLight,
        opacity: 0.1,
    },
    header: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: SPACING.xl,
    },
    logoIcon: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
    },
    logoInner: {
        width: 24,
        height: 24,
        backgroundColor: 'white',
        borderRadius: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.sm,
        lineHeight: 22,
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
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.xl,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        marginTop: SPACING.sm,
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
    signUpText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 15,
    },
});
