import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface InputProps {
    label?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: React.ReactNode;
    secureTextEntry?: boolean;
    error?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    style?: ViewStyle;
    multiline?: boolean;
    numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry,
    error,
    autoCapitalize,
    keyboardType,
    style,
    multiline,
    numberOfLines,
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputWrapper,
                { borderColor: error ? COLORS.error : COLORS.border }
            ]}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <TextInput
                    style={[styles.input, multiline && { height: 'auto', paddingTop: SPACING.sm, paddingBottom: SPACING.sm }]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={autoCapitalize}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        minHeight: 56,
    },
    iconWrapper: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: SPACING.xs,
        marginLeft: 4,
    },
});
