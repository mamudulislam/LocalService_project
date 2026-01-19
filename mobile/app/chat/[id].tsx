import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import { chatApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const [otherUser, setOtherUser] = useState<any>(null);

    const fetchMessages = async () => {
        try {
            if (!token || !id) return;
            // First get chat details to find other user - only needed once really, but kept here for simplicity
            if (!otherUser) {
                const chatsRes = await chatApi.getMyChats(token);
                const currentChat = chatsRes.data.find((c: any) => c._id === id);

                if (currentChat && currentChat.participants) {
                    const other = currentChat.participants.find((p: any) => p._id !== user?.id) || currentChat.participants[0];
                    setOtherUser(other);
                }
            }

            // Get messages
            const response = await chatApi.getMessages(id as string, token);
            // Only update if number of messages changed to avoid loop
            if (response.data.length !== messages.length) {
                setMessages(response.data);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [id, token, messages.length]); // Add messages.length to dependency to refresh closure when messages change


    const handleSendMessage = async () => {
        if (!newMessage.trim() || !token) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            await chatApi.sendMessage(id as string, content, token);
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally show error to user/restore message text
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId._id === user?.id || item.senderId === user?.id;

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.theirBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMe ? styles.myMessageText : styles.theirMessageText
                    ]}>{item.content}</Text>
                    <Text style={[
                        styles.timeText,
                        isMe ? styles.myTimeText : styles.theirTimeText
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{otherUser?.name || 'Chat'}</Text>
                    {otherUser && <Text style={styles.headerSubtitle}>Online</Text>}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item: any) => item._id || Math.random().toString()}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        backgroundColor: 'white',
    },
    backButton: {
        padding: SPACING.xs,
        marginRight: SPACING.md,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    messageContainer: {
        marginBottom: SPACING.md,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: SPACING.md,
        borderRadius: 20,
        ...SHADOWS.sm,
    },
    myBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: 'white',
    },
    theirMessageText: {
        color: COLORS.text,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirTimeText: {
        color: COLORS.textMuted,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.surfaceSubtle,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: 15,
        maxHeight: 100,
        marginRight: SPACING.md,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.surfaceSubtle,
    },
});
