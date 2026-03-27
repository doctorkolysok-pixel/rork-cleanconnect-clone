import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import { CharityOrder, OrderCategory } from '@/types';
import { Stack } from 'expo-router';
import { Heart, Gift, Sparkles, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

export default function CharityScreen() {
  const { user, charityOrders, addCharityOrder } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');

  const myCharityOrders = charityOrders.filter(co => co.donorId === user.id);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Выберите категорию', 'Пожалуйста, выберите тип услуги');
      return;
    }

    if (!recipientName.trim()) {
      Alert.alert('Укажите получателя', 'Пожалуйста, укажите имя получателя помощи');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Опишите помощь', 'Пожалуйста, опишите что нужно почистить');
      return;
    }

    const charityOrder: CharityOrder = {
      id: `charity-${Date.now()}`,
      donorId: user.id,
      recipientName: recipientName.trim(),
      category: selectedCategory,
      description: description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await addCharityOrder(charityOrder);

    Alert.alert(
      'Спасибо за доброту!',
      'Вы получили +100 баллов чистоты. Ваша заявка на благотворительную чистку отправлена.',
      [
        {
          text: 'Отлично',
          onPress: () => {
            setShowForm(false);
            setSelectedCategory(null);
            setRecipientName('');
            setDescription('');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Чисто с добром',
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' as const },
        }}
      />

      <View style={styles.hero}>
        <Heart color="#fff" size={48} fill="#fff" />
        <Text style={styles.heroTitle}>Чисто с добром</Text>
        <Text style={styles.heroSubtitle}>
          Помогите тем, кто нуждается в бесплатной чистке
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Gift color="#00BFA6" size={24} />
            </View>
            <Text style={styles.statValue}>{myCharityOrders.length}</Text>
            <Text style={styles.statLabel}>Помощь оказана</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Trophy color="#FFD700" size={24} />
            </View>
            <Text style={styles.statValue}>{user.cleanPoints}</Text>
            <Text style={styles.statLabel}>Баллов чистоты</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Sparkles color="#FFD700" size={24} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Как это работает?</Text>
            <Text style={styles.infoDescription}>
              Вы можете заказать бесплатную чистку для тех, кто в этом нуждается.
              За каждый благотворительный заказ вы получаете 100 баллов чистоты.
            </Text>
          </View>
        </View>

        {!showForm ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowForm(true)}
          >
            <Heart color="#fff" size={24} />
            <Text style={styles.createButtonText}>Оказать помощь</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Заявка на помощь</Text>

            <Text style={styles.label}>Категория</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                    { borderColor: category.color },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && { color: category.color },
                    ]}
                  >
                    {category.titleRu}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Кому помощь? *</Text>
            <TextInput
              style={styles.input}
              placeholder="Например: Пожилая соседка, Многодетная семья"
              placeholderTextColor="#999"
              value={recipientName}
              onChangeText={setRecipientName}
            />

            <Text style={styles.label}>Описание *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Опишите, что нужно почистить..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedCategory || !recipientName.trim() || !description.trim()) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  !selectedCategory || !recipientName.trim() || !description.trim()
                }
              >
                <Text style={styles.submitButtonText}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {myCharityOrders.length > 0 && (
          <View style={styles.ordersSection}>
            <Text style={styles.sectionTitle}>Моя помощь</Text>
            {myCharityOrders.map((order) => {
              const category = CATEGORIES.find(c => c.id === order.category);
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View
                      style={[
                        styles.orderCategoryBadge,
                        { backgroundColor: category?.color + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.orderCategoryText, { color: category?.color }]}
                      >
                        {category?.titleRu}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        order.status === 'completed' && styles.statusBadgeCompleted,
                        order.status === 'in_progress' && styles.statusBadgeInProgress,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {order.status === 'pending'
                          ? 'В ожидании'
                          : order.status === 'approved'
                          ? 'Одобрено'
                          : order.status === 'in_progress'
                          ? 'В работе'
                          : 'Выполнено'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderRecipient}>{order.recipientName}</Text>
                  <Text style={styles.orderDescription}>{order.description}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  hero: {
    backgroundColor: '#00BFA6',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 12,
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: '#f8f8f8',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#00BFA6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  ordersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderCategoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E8F5F3',
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  orderRecipient: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  orderDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 13,
    color: '#999',
  },
});
