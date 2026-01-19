import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    padded?: boolean;
    elevated?: boolean;
    glassy?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    onPress,
    padded = true,
    elevated = true,
    glassy = false,
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={onPress ? 0.9 : 1}
            style={[
                styles.card,
                padded && { padding: SPACING.md },
                elevated && SHADOWS.sm,
                glassy && styles.glassy,
                style,
            ]}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    glassy: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
});
