import { useApp, useOrderOffers } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import { Offer } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Sparkles, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';

export default function CleanerOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, addOffer, user } = useApp();
  const existingOffers = useOrderOffers(id || '');

  const order = orders.find(o => o.id === id);
  const [proposedPrice, setProposedPrice] = useState('');
  const [comment, setComment] = useState('');
  const [eta, setEta] = useState('2-3 дня');

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  const category = CATEGORIES.find(c => c.id === order.category);
  const hasAiAnalysis = order.aiAnalysis && 'stainType' in order.aiAnalysis;
  const myOffer = existingOffers.find(o => o.cleanerId === user.id);

  const handleSendOffer = () => {
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      Alert.alert('Ошибка', 'Укажите вашу цену');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Ошибка', 'Добавьте комментарий');
      return;
    }

    const offer: Offer = {
      id: `offer-${Date.now()}`,
      orderId: order.id,
      cleanerId: user.id,
      cleanerName: user.name,
      cleanerRating: user.rating,
      proposedPrice: parseFloat(proposedPrice),
      comment,
      eta,
      createdAt: new Date().toISOString(),
    };

    addOffer(offer);
    Alert.alert('Успешно!', 'Ваше предложение отправлено', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Детали заказа</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={[styles.categoryBadge, { backgroundColor: category?.color + '20' }]}>
            <Text style={[styles.categoryText, { color: category?.color }]}>
              {category?.titleRu}
            </Text>
          </View>

          {order.photos[0] && (
            <Image
              source={{ uri: order.photos[0] }}
              style={styles.orderImage}
              contentFit="cover"
            />
          )}

          <Text style={styles.orderComment}>{order.comment}</Text>

          <View style={styles.infoRow}>
            <MapPin size={18} color="#999" />
            <Text style={styles.infoText}>{order.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={18} color="#999" />
            <Text style={styles.infoText}>
              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Предложенная клиентом цена:</Text>
            <Text style={styles.priceValue}>{order.priceOffer} ₸</Text>
          </View>
        </View>

        {hasAiAnalysis && order.aiAnalysis && 'stainType' in order.aiAnalysis && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>AI Анализ</Text>
            </View>
            <View style={styles.aiCard}>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Тип пятна:</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.stainType}</Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Материал:</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.fabricType}</Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Сложность:</Text>
                <Text style={styles.aiValue}>
                  {order.aiAnalysis.difficulty === 'easy'
                    ? 'Легко'
                    : order.aiAnalysis.difficulty === 'medium'
                    ? 'Средне'
                    : 'Сложно'}
                </Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Уверенность AI:</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.confidence}%</Text>
              </View>
              {order.aiAnalysis.recommendations && order.aiAnalysis.recommendations.length > 0 && (
                <View style={styles.recommendations}>
                  <Text style={styles.recommendationsTitle}>Рекомендации:</Text>
                  {order.aiAnalysis.recommendations.map((rec, idx) => (
                    <Text key={idx} style={styles.recommendation}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {myOffer ? (
          <View style={styles.section}>
            <View style={styles.alreadySentCard}>
              <Text style={styles.alreadySentTitle}>✓ Предложение отправлено</Text>
              <Text style={styles.alreadySentText}>
                Ваша цена: {myOffer.proposedPrice} ₸
              </Text>
              <Text style={styles.alreadySentText}>Срок: {myOffer.eta}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Отправить предложение</Text>

            <Text style={styles.label}>Ваша цена *</Text>
            <TextInput
              style={styles.input}
              placeholder="Укажите цену"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={proposedPrice}
              onChangeText={setProposedPrice}
            />

            <Text style={styles.label}>Срок выполнения *</Text>
            <View style={styles.etaButtons}>
              {['1-2 дня', '2-3 дня', '3-5 дней', '1 неделя'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.etaButton,
                    eta === option && styles.etaButtonActive,
                  ]}
                  onPress={() => setEta(option)}
                >
                  <Text
                    style={[
                      styles.etaButtonText,
                      eta === option && styles.etaButtonTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Комментарий *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Расскажите о своем опыте..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity style={styles.sendButton} onPress={handleSendOffer}>
              <Text style={styles.sendButtonText}>Отправить предложение</Text>
            </TouchableOpacity>
          </View>
        )}

        {existingOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Другие предложения ({existingOffers.length})
            </Text>
            {existingOffers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.cleanerAvatar}>
                    <User size={20} color="#fff" />
                  </View>
                  <View style={styles.offerInfo}>
                    <Text style={styles.cleanerName}>{offer.cleanerName}</Text>
                    <Text style={styles.cleanerRating}>★ {offer.cleanerRating}</Text>
                  </View>
                  <Text style={styles.offerPrice}>{offer.proposedPrice} ₸</Text>
                </View>
                <Text style={styles.offerComment}>{offer.comment}</Text>
                <Text style={styles.offerEta}>Срок: {offer.eta}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  orderImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderComment: {
    fontSize: 16,
    color: '#1E1E1E',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
  },
  priceCard: {
    backgroundColor: '#E8F5F3',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  aiCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiLabel: {
    fontSize: 14,
    color: '#666',
  },
  aiValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  recommendations: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  etaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  etaButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00BFA6',
    backgroundColor: '#fff',
  },
  etaButtonActive: {
    backgroundColor: '#00BFA6',
  },
  etaButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  etaButtonTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  alreadySentCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  alreadySentTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4CAF50',
    marginBottom: 8,
  },
  alreadySentText: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  offerCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cleanerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  offerInfo: {
    flex: 1,
  },
  cleanerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  cleanerRating: {
    fontSize: 13,
    color: '#FFD700',
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  offerComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  offerEta: {
    fontSize: 13,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
