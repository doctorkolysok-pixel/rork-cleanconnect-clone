import { useApp } from '@/contexts/AppContext';
import { MOCK_CLEANERS } from '@/mocks/cleaners';
import { CATEGORIES } from '@/constants/categories';
import { Message } from '@/types';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Send, Sparkles, Video } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function ChatScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, messages, sendMessage, user } = useApp();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const order = orders.find(o => o.id === orderId);
  const chatMessages = useMemo(
    () => messages.filter(m => m.orderId === orderId).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
    [messages, orderId]
  );

  const cleaner = order?.chosenCleanerId
    ? MOCK_CLEANERS.find(c => c.id === order.chosenCleanerId)
    : null;

  const category = CATEGORIES.find(c => c.id === order?.category);
  const supportsLiveStream = category?.supportsLiveStream || false;

  useEffect(() => {
    if (chatMessages.length === 0 && cleaner && order && orderId) {
      const welcomeMessage: Message = {
        id: `msg-welcome-${Date.now()}`,
        orderId,
        fromId: cleaner.id,
        toId: user.id,
        message: `Здравствуйте! Я принял ваш заказ. Приступлю к работе в ближайшее время. Если есть вопросы - пишите!`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      sendMessage(welcomeMessage);
    }
  }, [chatMessages.length, cleaner, order, orderId, sendMessage, user.id]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || inputText.trim();
    if (!messageText || !orderId || !cleaner) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      orderId,
      fromId: user.id,
      toId: cleaner.id,
      message: messageText,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await sendMessage(message);
    if (!customMessage) {
      setInputText('');
    }

    setTimeout(async () => {
      const responses = [
        'Понял, учту это!',
        'Хорошо, обязательно сделаю',
        'Спасибо за информацию',
        'Отлично, буду знать',
        'Да, конечно!',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const reply: Message = {
        id: `msg-${Date.now()}`,
        orderId,
        fromId: cleaner.id,
        toId: user.id,
        message: randomResponse,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await sendMessage(reply);
    }, 1000 + Math.random() * 2000);
  };

  if (!order || !cleaner) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Чат' }} />
        <Text style={styles.errorText}>Заказ не найден или исполнитель не выбран</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: cleaner.name,
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' as const },
        }}
      />

      <View style={styles.topBanner}>
        <View style={styles.aiAssistantBanner}>
          <Sparkles color="#FFD700" size={16} />
          <Text style={styles.aiAssistantText}>
            AI помощник поможет с вопросами о чистке
          </Text>
        </View>
        {supportsLiveStream && order.status === 'in_progress' && (
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleSend('Можно включить прямую трансляцию? Хочу наблюдать за процессом работы 🎥')}
          >
            <Video color="#00BFA6" size={16} />
            <Text style={styles.quickActionText}>Запросить трансляцию</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatMessages.map((msg) => {
          const isMyMessage = msg.fromId === user.id;
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.theirMessageText,
                ]}
              >
                {msg.message}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                ]}
              >
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Напишите сообщение..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  topBanner: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aiAssistantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  aiAssistantText: {
    fontSize: 13,
    color: '#F57F17',
    flex: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickActionText: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '600' as const,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#00BFA6',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#1E1E1E',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1E1E1E',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
