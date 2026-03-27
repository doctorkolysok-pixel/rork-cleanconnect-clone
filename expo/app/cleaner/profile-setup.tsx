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
  KeyboardAvoidingView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import { AVG_PRICES } from '@/constants/avgPrices';
import { OrderCategory } from '@/types';
import { Building2, MapPin, Clock, DollarSign, CheckCircle2, Users } from 'lucide-react-native';

type ServicePrice = {
  category: OrderCategory;
  enabled: boolean;
  price: string;
};

export default function CleanerProfileSetup() {
  const { user, saveUser } = useApp();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [workingHours, setWorkingHours] = useState('9:00 - 20:00');
  const [staffCount, setStaffCount] = useState('1');
  
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>(
    CATEGORIES.map(cat => ({
      category: cat.id,
      enabled: false,
      price: AVG_PRICES[cat.id].toString(),
    }))
  );

  const toggleService = (category: OrderCategory) => {
    setServicePrices(prev =>
      prev.map(sp =>
        sp.category === category ? { ...sp, enabled: !sp.enabled } : sp
      )
    );
  };

  const updatePrice = (category: OrderCategory, price: string) => {
    setServicePrices(prev =>
      prev.map(sp =>
        sp.category === category ? { ...sp, price } : sp
      )
    );
  };

  const handleSave = async () => {
    if (!companyName || !address) {
      alert('Заполните название компании и адрес');
      return;
    }

    const enabledServices = servicePrices.filter(sp => sp.enabled);
    if (enabledServices.length === 0) {
      alert('Выберите хотя бы одну услугу');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pricesMap: Record<string, number> = {};
      servicePrices.forEach(sp => {
        if (sp.enabled) {
          pricesMap[sp.category] = parseInt(sp.price) || AVG_PRICES[sp.category];
        }
      });

      const updatedUser = {
        ...user,
        companyName,
        address,
        description,
        workingHours,
        servicePrices: pricesMap,
        staffCount: parseInt(staffCount) || 1,
        isProfileComplete: true,
      };

      await saveUser(updatedUser);

      router.replace('/(tabs)/cleaner-works');
    } catch (error) {
      console.error('Profile setup error:', error);
      alert('Ошибка сохранения профиля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Building2 color="#00BFA6" size={32} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Настройка профиля</Text>
            <Text style={styles.subtitle}>Заполните данные для работы</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Основная информация</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Building2 color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Название компании"
                value={companyName}
                onChangeText={setCompanyName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Clock color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Время работы"
                value={workingHours}
                onChangeText={setWorkingHours}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Users color="#00BFA6" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Количество сотрудников"
                value={staffCount}
                onChangeText={setStaffCount}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Описание услуг (необязательно)"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <DollarSign color="#00BFA6" size={24} />
              <Text style={styles.sectionTitle}>Услуги и цены</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Выберите услуги и установите свои цены
            </Text>

            {servicePrices.map((sp) => {
              const category = CATEGORIES.find(c => c.id === sp.category);
              if (!category) return null;

              return (
                <View key={sp.category} style={styles.serviceItem}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <View
                        style={[
                          styles.serviceIconContainer,
                          { backgroundColor: category.color + '20' }
                        ]}
                      >
                        <Text style={styles.serviceEmoji}>{category.icon}</Text>
                      </View>
                      <View style={styles.serviceTextContainer}>
                        <Text style={styles.serviceTitle}>{category.titleRu}</Text>
                        <Text style={styles.serviceAvgPrice}>
                          Средняя цена: {AVG_PRICES[sp.category].toLocaleString('ru-KZ')} ₸
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={sp.enabled}
                      onValueChange={() => toggleService(sp.category)}
                      trackColor={{ false: '#E0E0E0', true: '#00BFA6' }}
                      thumbColor="#fff"
                    />
                  </View>

                  {sp.enabled && (
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.priceLabel}>Ваша цена:</Text>
                      <View style={styles.priceInputGroup}>
                        <TextInput
                          style={styles.priceInput}
                          value={sp.price}
                          onChangeText={(value) => updatePrice(sp.category, value)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#999"
                        />
                        <Text style={styles.currency}>₸</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle2 color="#fff" size={20} strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Сохранить профиль</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Вы сможете изменить эти данные позже в настройках профиля
          </Text>
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    minHeight: 100,
  },
  serviceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  serviceAvgPrice: {
    fontSize: 13,
    color: '#666',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingLeft: 60,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  priceInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 44,
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    minWidth: 80,
    textAlign: 'right',
  },
  currency: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00BFA6',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  footerNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
