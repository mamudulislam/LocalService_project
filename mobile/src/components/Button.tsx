import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) => {
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isDanger = variant === 'danger';

    const getBackgroundColor = () => {
        if (disabled) return COLORS.surfaceSubtle;
        if (isOutline || isGhost) return 'transparent';
        if (isDanger) return COLORS.error;
        if (variant === 'secondary') return COLORS.secondary;
        return COLORS.primary;
    };

    const getTextColor = () => {
        if (disabled) return COLORS.textMuted;
        if (isOutline || isGhost) return isDanger ? COLORS.error : COLORS.primary;
        return COLORS.textOnPrimary;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: isOutline ? (isDanger ? COLORS.error : COLORS.primary) : 'transparent',
                    borderWidth: isOutline ? 1.5 : 0,
                    paddingVertical: size === 'sm' ? SPACING.sm : size === 'lg' ? SPACING.lg : SPACING.md,
                },
                !isGhost && !isOutline && !disabled && SHADOWS.md,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
                                marginLeft: icon ? SPACING.sm : 0,
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    text: {
        fontWeight: '700',
    },
});
