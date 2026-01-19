import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const { token, user } = useAuthStore();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';

        // If not logged in and trying to access protected routes
        if (!token && !inAuthGroup) {
            // Redirect to login
            router.replace('/(auth)/login');
        }
        // If logged in and trying to access auth pages
        else if (token && inAuthGroup) {
            // Redirect to home
            router.replace('/(tabs)');
        }
    }, [token, segments]);
}
