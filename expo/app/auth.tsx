import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { TRPCClientError } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/backend/trpc/app-router';
import type { User as AppUser, UserRole } from '@/types';
import { User as UserIcon, Lock, Phone, Mail, Sparkles } from 'lucide-react-native';

type AuthMode = 'signup' | 'login';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ServerUser = RouterOutputs['auth']['login'] | RouterOutputs['auth']['register'];

const normalizeUser = (record: ServerUser, overrides?: Partial<AppUser>): AppUser => {
  const base: AppUser = {
    id: record.id,
    role: record.role as UserRole,
    name: record.name,
    phone: record.phone,
    email: 'email' in record && record.email ? record.email : undefined,
    rating: 'rating' in record && record.rating !== null ? record.rating : 5,
    balance: 'balance' in record && record.balance !== null ? record.balance : 0,
    cleanPoints: 'cleanPoints' in record && record.cleanPoints !== null ? record.cleanPoints : 0,
    level: 'level' in record && record.level !== null ? record.level : 1,
    createdAt: 'createdAt' in record && record.createdAt ? record.createdAt : new Date().toISOString(),
    monthlyRevenueGoal: overrides?.monthlyRevenueGoal ?? 0,
    monthlyExpenseBudget: overrides?.monthlyExpenseBudget ?? 0,
  };

  return {
    ...base,
    ...overrides,
  };
};

export default function AuthPage() {
  const { saveUser } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Backend отключен - используем локальное хранилище
  // const registerMutation = trpc.auth.register.useMutation();
  // const loginMutation = trpc.auth.login.useMutation();

  const resetError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleAuth = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompanyName = companyName.trim();
    const trimmedCompanyAddress = companyAddress.trim();

    if (mode === 'signup' && (!trimmedName || !trimmedPhone || !trimmedPassword)) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    if (mode === 'login' && (!trimmedPhone || !trimmedPassword)) {
      Alert.alert('Ошибка', 'Введите телефон и пароль');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Локальная регистрация без backend
        const newUser: AppUser = {
          id: `user-${Date.now()}`,
          role: selectedRole,
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail || undefined,
          rating: 5.0,
          balance: 0,
          cleanPoints: 50,
          level: 1,
          createdAt: new Date().toISOString(),
          companyName: selectedRole === 'cleaner' && trimmedCompanyName ? trimmedCompanyName : undefined,
          address: selectedRole === 'cleaner' && trimmedCompanyAddress ? trimmedCompanyAddress : undefined,
          monthlyRevenueGoal: 0,
          monthlyExpenseBudget: 0,
        };

        await saveUser(newUser);

        if (selectedRole === 'cleaner') {
          router.replace('/cleaner/profile-setup');
        } else if (selectedRole === 'courier') {
          router.replace('/(tabs)/orders');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        // Локальный вход без backend - используем выбранную роль
        const mockUser: AppUser = {
          id: `user-${Date.now()}`,
          role: selectedRole,
          name: trimmedName || 'Пользователь',
          phone: trimmedPhone,
          email: trimmedEmail || 'test@tazago.kz',
          rating: 5.0,
          balance: 0,
          cleanPoints: 100,
          level: 2,
          createdAt: new Date().toISOString(),
          monthlyRevenueGoal: 0,
          monthlyExpenseBudget: 0,
        };

        await saveUser(mockUser);
        
        // Перенаправляем на страницу соответствующую роли
        if (selectedRole === 'cleaner') {
          router.replace('/(tabs)/cleaner-works');
        } else if (selectedRole === 'courier') {
          router.replace('/(tabs)/courier-deliveries');
        } else if (selectedRole === 'partner') {
          router.replace('/(tabs)/partner-dashboard');
        } else {
          router.replace('/(tabs)/home');
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      let message = 'Ошибка авторизации';

      if (error instanceof TRPCClientError && error.message.includes('Failed to fetch')) {
        message = '❌ Бэкенд-сервер не запущен!\n\n📝 Решение:\n1. Откройте новый терминал\n2. Выполните: bun server/index.ts\n3. Дождитесь запуска сервера\n4. Попробуйте снова\n\nℹ️ Подробнее: ЗАПУСК_ПРИЛОЖЕНИЯ.md';
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
      ) {
        message = (error as { message?: string }).message as string;
      }

      setErrorMessage(message);
      Alert.alert('Ошибка', message);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleButton = ({ role, icon, label }: { role: UserRole; icon: string; label: string }) => {
    const isSelected = selectedRole === role;
    return (
      <TouchableOpacity
        style={[styles.roleButton, isSelected && styles.roleButtonSelected]}
        onPress={() => {
          setSelectedRole(role);
          setErrorMessage(null);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.roleIcon}>{icon}</Text>
        <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Sparkles color="#FFD700" size={40} strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.title}>TazaGo</Text>
            <Text style={styles.subtitle}>Kaspi для чистоты</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.modeSwitch}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeButtonText, mode === 'signup' && styles.modeButtonTextActive]}>
                  Регистрация
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
                onPress={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeButtonText, mode === 'login' && styles.modeButtonTextActive]}>
                  Вход
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Выберите роль</Text>
            <View style={styles.rolesContainer}>
              <RoleButton role="client" icon="👤" label="Клиент" />
              <RoleButton role="cleaner" icon="👔" label="Исполнитель" />
            </View>
            <View style={styles.rolesContainer}>
              <RoleButton role="courier" icon="🚗" label="Курьер" />
              <RoleButton role="partner" icon="🏢" label="Партнёр" />
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <UserIcon color="#00BFA6" size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Имя"
                  value={name}
                  onChangeText={(value) => {
                    resetError();
                    setName(value);
                  }}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Phone color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="+7 777 123 4567"
                value={phone}
                onChangeText={(value) => {
                  resetError();
                  setPhone(value);
                }}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Mail color="#00BFA6" size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email (необязательно)"
                  value={email}
                  onChangeText={(value) => {
                    resetError();
                    setEmail(value);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Lock color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={password}
                onChangeText={(value) => {
                  resetError();
                  setPassword(value);
                }}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            {mode === 'signup' && selectedRole === 'cleaner' && (
              <>
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Информация об исполнителе</Text>
                <TextInput
                  style={styles.inputFull}
                  placeholder="Название компании"
                  value={companyName}
                  onChangeText={(value) => {
                    resetError();
                    setCompanyName(value);
                  }}
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.inputFull}
                  placeholder="Адрес"
                  value={companyAddress}
                  onChangeText={(value) => {
                    resetError();
                    setCompanyAddress(value);
                  }}
                  placeholderTextColor="#999"
                />
              </>
            )}

            {mode === 'signup' && selectedRole === 'courier' && (
              <>
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Тип транспорта</Text>
                <View style={styles.transportContainer}>
                  <TouchableOpacity style={styles.transportButton} activeOpacity={0.7}>
                    <Text style={styles.transportIcon}>🚗</Text>
                    <Text style={styles.transportText}>Авто</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.transportButton} activeOpacity={0.7}>
                    <Text style={styles.transportIcon}>🏍️</Text>
                    <Text style={styles.transportText}>Мото</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.transportButton} activeOpacity={0.7}>
                    <Text style={styles.transportIcon}>🚶</Text>
                    <Text style={styles.transportText}>Пеший</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'signup' ? 'Создать аккаунт' : 'Войти'}
                </Text>
              )}
            </TouchableOpacity>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {mode === 'signup' && (
              <View style={styles.bonusCard}>
                <Sparkles color="#FFD700" size={16} />
                <Text style={styles.bonusText}>+50 Clean Points за регистрацию!</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'signup' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const nextMode: AuthMode = mode === 'signup' ? 'login' : 'signup';
                setMode(nextMode);
                setErrorMessage(null);
              }}
            >
              <Text style={styles.footerLink}>
                {mode === 'signup' ? 'Войти' : 'Зарегистрироваться'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500' as const,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#00BFA6',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonSelected: {
    backgroundColor: '#E0F7F4',
    borderColor: '#00BFA6',
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
  },
  roleLabelSelected: {
    color: '#00BFA6',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E1E1E',
  },
  inputFull: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 12,
  },
  transportContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  transportButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  transportIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  transportText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  errorBanner: {
    marginTop: 16,
    backgroundColor: '#FFECEC',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#D32F2F',
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEA',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#D97706',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#666',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
});
