import { useApp, useOrderOffers, useOrderLiveStream } from '@/contexts/AppContext';
import { CATEGORIES, DIFFICULTY_COLORS, CLIENT_STATUS_DISPLAY } from '@/constants/categories';
import { MOCK_CLEANERS } from '@/mocks/cleaners';
import { Offer } from '@/types';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Clock, MapPin, Sparkles, Star, Check, Leaf, MessageCircle, CheckCircle, Video, TrendingUp, Shield } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, addOffer, acceptOffer, completeOrder } = useApp();
  const orderOffers = useOrderOffers(id || '');
  const liveStream = useOrderLiveStream(id || '');

  const order = orders.find(o => o.id === id);

  useEffect(() => {
    if (order && order.status === 'new' && orderOffers.length === 0) {
      const timer = setTimeout(() => {
        generateMockOffers();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order, orderOffers.length]);

  const generateMockOffers = () => {
    if (!order) return;

    const selectedCleaners = MOCK_CLEANERS
      .filter(c => c.specialties.includes(order.category))
      .slice(0, 3);

    selectedCleaners.forEach((cleaner, index) => {
      const basePrice = order.priceOffer;
      const variation = (Math.random() - 0.5) * 0.3;
      const proposedPrice = Math.round(basePrice * (1 + variation));

      const offer: Offer = {
        id: `offer-${order.id}-${cleaner.id}`,
        orderId: order.id,
        cleanerId: cleaner.id,
        cleanerName: cleaner.name,
        cleanerRating: cleaner.rating,
        proposedPrice,
        comment: 'Готов выполнить качественно и в срок! Есть опыт работы с подобными заказами.',
        eta: `${1 + index} день`,
        createdAt: new Date(Date.now() + index * 1000).toISOString(),
      };

      setTimeout(() => {
        addOffer(offer);
      }, index * 1500);
    });
  };

  const handleAcceptOffer = async (offer: Offer) => {
    console.log('handleAcceptOffer called', offer);
    try {
      console.log('Accepting offer...');
      await acceptOffer(offer);
      console.log('Offer accepted, order status updated');
    } catch (error) {
      console.error('Error accepting offer:', error);
      Alert.alert('Ошибка', 'Не удалось принять предложение');
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Заказ не найден' }} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  const category = CATEGORIES.find(c => c.id === order.category);
  const supportsLiveStream = category?.supportsLiveStream || false;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Заказ #${order.id.slice(-6)}` }} />

      {order.photos[0] && (
        <Image
          source={{ uri: order.photos[0] }}
          style={styles.heroImage}
          contentFit="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryBadgeText, { color: category?.color }]}>
            {category?.titleRu}
          </Text>
        </View>

        <Text style={styles.orderTitle}>{order.comment}</Text>

        {renderStatusProgress(order.status)}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin color="#999" size={16} />
            <Text style={styles.metaText}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Предложенная цена</Text>
          <Text style={styles.priceValue}>{order.priceOffer} ₸</Text>
        </View>

        {order.tazaIndex && (
          <View style={styles.tazaIndexCard}>
            <View style={styles.tazaIndexHeader}>
              <View style={styles.tazaIndexTitleRow}>
                <TrendingUp color={order.tazaIndex.level === 'economy' ? '#FF6B6B' : order.tazaIndex.level === 'standard' ? '#FFD700' : order.tazaIndex.level === 'optimal' ? '#4CAF50' : '#FFD700'} size={20} strokeWidth={2} />
                <Text style={styles.tazaIndexTitle}>Taza Index</Text>
              </View>
              <View style={[styles.tazaIndexBadge, { backgroundColor: (order.tazaIndex.level === 'economy' ? '#FF6B6B' : order.tazaIndex.level === 'standard' ? '#FFD700' : order.tazaIndex.level === 'optimal' ? '#4CAF50' : '#FFD700') + '15' }]}>
                <Text style={styles.tazaIndexEmoji}>
                  {order.tazaIndex.level === 'economy' ? '🔴' : order.tazaIndex.level === 'standard' ? '🟡' : order.tazaIndex.level === 'optimal' ? '🟢' : '💛'}
                </Text>
                <Text style={[styles.tazaIndexBadgeText, { color: order.tazaIndex.level === 'economy' ? '#FF6B6B' : order.tazaIndex.level === 'standard' ? '#FFD700' : order.tazaIndex.level === 'optimal' ? '#4CAF50' : '#FFD700' }]}>
                  {order.tazaIndex.level === 'economy' ? 'Эконом' : order.tazaIndex.level === 'standard' ? 'Стандарт' : order.tazaIndex.level === 'optimal' ? 'Оптимум' : 'Премиум'}
                </Text>
              </View>
            </View>

            <View style={styles.tazaIndexBar}>
              <View style={[styles.tazaIndexBarFill, { width: `${Math.min(order.tazaIndex.index, 150)}%`, backgroundColor: order.tazaIndex.level === 'economy' ? '#FF6B6B' : order.tazaIndex.level === 'standard' ? '#FFD700' : order.tazaIndex.level === 'optimal' ? '#4CAF50' : '#FFD700' }]} />
              <Text style={[styles.tazaIndexValue, { color: order.tazaIndex.level === 'economy' ? '#FF6B6B' : order.tazaIndex.level === 'standard' ? '#FFD700' : order.tazaIndex.level === 'optimal' ? '#4CAF50' : '#FFD700' }]}>
                {order.tazaIndex.index}%
              </Text>
            </View>

            <Text style={styles.tazaIndexDescription}>
              {order.tazaIndex.level === 'economy' ? 'Цена ниже рыночной. Возможно низкое качество работы.' : order.tazaIndex.level === 'standard' ? 'Обычный режим. Базовая защита включена.' : order.tazaIndex.level === 'optimal' ? 'Отличное соотношение цены и качества!' : 'Premium Protection активирована! Максимальная защита заказа.'}
            </Text>

            {order.tazaIndex.protectionEnabled && (
              <View style={styles.protectionBox}>
                <Shield color="#FFD700" size={18} strokeWidth={2} fill="#FFD700" />
                <Text style={styles.protectionText}>Premium Protection активирована</Text>
              </View>
            )}
          </View>
        )}

        {order.aiAnalysis && (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Sparkles color="#FFD700" size={20} />
              <Text style={styles.aiTitle}>AI Анализ</Text>
            </View>
            <View style={styles.aiGrid}>
              <View style={styles.aiItem}>
                <Text style={styles.aiLabel}>Тип пятна</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.stainType}</Text>
              </View>
              <View style={styles.aiItem}>
                <Text style={styles.aiLabel}>Материал</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.fabricType}</Text>
              </View>
              <View style={styles.aiItem}>
                <Text style={styles.aiLabel}>Сложность</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: DIFFICULTY_COLORS[order.aiAnalysis.difficulty] },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {order.aiAnalysis.difficulty === 'easy'
                      ? 'Легко'
                      : order.aiAnalysis.difficulty === 'medium'
                      ? 'Средне'
                      : 'Сложно'}
                  </Text>
                </View>
              </View>
              <View style={styles.aiItem}>
                <Text style={styles.aiLabel}>Оценка AI</Text>
                <Text style={styles.aiValue}>{order.aiAnalysis.estimatedPrice} ₸</Text>
              </View>
            </View>
            {order.aiAnalysis.recommendations.length > 0 && (
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
        )}

        <View style={styles.offersSection}>
          <Text style={styles.offersTitle}>
            Предложения ({orderOffers.length})
          </Text>

          {orderOffers.length === 0 ? (
            <View style={styles.emptyOffers}>
              <Clock color="#00BFA6" size={48} />
              <Text style={styles.emptyOffersText}>
                Ожидаем предложения от химчисток...
              </Text>
            </View>
          ) : (
            orderOffers.map((offer) => {
              const cleaner = MOCK_CLEANERS.find(c => c.id === offer.cleanerId);
              const isChosen = order.chosenCleanerId === offer.cleanerId;

              return (
                <View
                  key={offer.id}
                  style={[styles.offerCard, isChosen && styles.offerCardChosen]}
                >
                  <View style={styles.offerHeader}>
                    <View style={styles.offerCleanerInfo}>
                      <View style={styles.offerAvatar}>
                        <Text style={styles.offerAvatarText}>
                          {offer.cleanerName[0]}
                        </Text>
                      </View>
                      <View style={styles.offerCleanerDetails}>
                        <View style={styles.offerNameRow}>
                          <Text style={styles.offerCleanerName}>
                            {offer.cleanerName}
                          </Text>
                          {cleaner?.ecoFriendly && (
                            <View style={styles.ecoBadge}>
                              <Leaf color="#4CAF50" size={12} />
                            </View>
                          )}
                          {isChosen && (
                            <View style={styles.chosenBadge}>
                              <Check color="#fff" size={12} />
                            </View>
                          )}
                        </View>
                        <View style={styles.offerRatingRow}>
                          <Star color="#FFD700" size={14} fill="#FFD700" />
                          <Text style={styles.offerRating}>{offer.cleanerRating}</Text>
                          <Text style={styles.offerEta}>• {offer.eta}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.offerPrice}>{offer.proposedPrice} ₸</Text>
                  </View>

                  {offer.comment && (
                    <Text style={styles.offerComment}>{offer.comment}</Text>
                  )}

                  {!isChosen && (order.status === 'new' || order.status === 'offers_received') && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => {
                        console.log('Select button pressed', offer);
                        handleAcceptOffer(offer);
                      }}
                    >
                      <Text style={styles.acceptButtonText}>Выбрать</Text>
                    </TouchableOpacity>
                  )}

                  {isChosen && (
                    <View style={styles.chosenLabel}>
                      <Check color="#00BFA6" size={16} />
                      <Text style={styles.chosenLabelText}>Выбран</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {order.status === 'in_progress' && order.chosenCleanerId && (
          <View style={styles.actionsSection}>
            {supportsLiveStream && (
              liveStream ? (
                <TouchableOpacity
                  style={styles.liveStreamButton}
                  onPress={() => router.push(`/livestream/${id}` as any)}
                >
                  <View style={styles.liveStreamContent}>
                    <View style={styles.liveStreamLeft}>
                      <Video color="#fff" size={20} />
                      <View>
                        <Text style={styles.liveStreamTitle}>Посмотреть работу онлайн</Text>
                        <View style={styles.liveIndicatorSmall}>
                          <View style={styles.liveDotSmall} />
                          <Text style={styles.liveTextSmall}>В эфире</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.liveStreamPromo}>
                  <View style={styles.liveStreamPromoContent}>
                    <Video color="#00BFA6" size={24} />
                    <View style={styles.liveStreamPromoText}>
                      <Text style={styles.liveStreamPromoTitle}>Прямая трансляция доступна</Text>
                      <Text style={styles.liveStreamPromoSubtitle}>
                        Попросите исполнителя включить трансляцию, чтобы видеть процесс работы
                      </Text>
                    </View>
                  </View>
                </View>
              )
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/chat/${id}` as any)}
            >
              <MessageCircle color="#fff" size={20} />
              <Text style={styles.actionButtonTextWhite}>Открыть чат</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => {
                Alert.alert(
                  'Завершить заказ?',
                  'Вы уверены, что работа выполнена?',
                  [
                    { text: 'Отмена', style: 'cancel' },
                    {
                      text: 'Да, завершить',
                      onPress: async () => {
                        await completeOrder(order.id);
                        router.push(`/review/${id}` as any);
                      },
                    },
                  ]
                );
              }}
            >
              <CheckCircle color="#00BFA6" size={20} />
              <Text style={styles.actionButtonTextGreen}>Завершить заказ</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'completed' && (
          <View style={styles.completedSection}>
            <View style={styles.completedBadge}>
              <CheckCircle color="#4CAF50" size={24} />
              <Text style={styles.completedText}>Заказ выполнен</Text>
            </View>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => router.push(`/review/${id}` as any)}
            >
              <Star color="#fff" size={20} />
              <Text style={styles.reviewButtonText}>Оставить отзыв</Text>
            </TouchableOpacity>
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
  heroImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  metaRow: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 15,
    color: '#666',
  },
  priceCard: {
    backgroundColor: '#00BFA6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
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
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  aiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  aiItem: {
    width: '48%',
  },
  aiLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  aiValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  recommendations: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  offersSection: {
    marginTop: 8,
  },
  offersTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  emptyOffers: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
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
  emptyOffersText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  offerCard: {
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
  offerCardChosen: {
    borderWidth: 2,
    borderColor: '#00BFA6',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerCleanerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  offerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  offerAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  offerCleanerDetails: {
    flex: 1,
  },
  offerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  offerCleanerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  ecoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chosenBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offerRating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  offerEta: {
    fontSize: 14,
    color: '#999',
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  offerComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: '#00BFA6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  chosenLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#E8F5F3',
    borderRadius: 10,
  },
  chosenLabelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  actionsSection: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  actionButtonSecondary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#00BFA6',
  },
  actionButtonTextWhite: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  actionButtonTextGreen: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  completedSection: {
    marginTop: 24,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4CAF50',
  },
  reviewButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  liveStreamButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  liveStreamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveStreamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveStreamTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  liveIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveTextSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  liveStreamPromo: {
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00BFA6',
    ...Platform.select({
      ios: {
        shadowColor: '#00BFA6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  liveStreamPromoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  liveStreamPromoText: {
    flex: 1,
    gap: 4,
  },
  liveStreamPromoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  liveStreamPromoSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  tazaIndexCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  tazaIndexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tazaIndexTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tazaIndexTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  tazaIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tazaIndexEmoji: {
    fontSize: 16,
  },
  tazaIndexBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tazaIndexBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  tazaIndexBarFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: '2%',
  },
  tazaIndexValue: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  tazaIndexDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  protectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  protectionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFD700',
    flex: 1,
  },
  statusProgressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusProgressTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  statusProgressDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  statusStepsContainer: {
    paddingVertical: 8,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  statusStepLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    bottom: -8,
    backgroundColor: '#E0E0E0',
  },
  statusStepLineActive: {
    backgroundColor: '#00BFA6',
  },
  statusStepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  statusStepDotActive: {
    backgroundColor: '#00BFA6',
  },
  statusStepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusStepDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  statusStepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  statusStepLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  statusStepLabelActive: {
    color: '#00BFA6',
    fontWeight: '700' as const,
  },
  statusStepLabelCompleted: {
    color: '#4CAF50',
  },
  statusStepDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
});

function renderStatusProgress(status: string) {
  const steps = [
    { key: 'new', label: 'Новый', description: 'Ожидаем предложения' },
    { key: 'at_partner', label: 'Принято', description: 'Получено точкой приёма' },
    { key: 'partner_working', label: 'В цехе', description: 'Изделие в работе' },
    { key: 'partner_done', label: 'Готово', description: 'Работа выполнена' },
    { key: 'courier_to_client', label: 'В точке', description: 'Готово к получению' },
  ];

  const statusOrder = ['new', 'offers_received', 'in_progress', 'courier_to_partner', 'at_partner', 'partner_working', 'partner_done', 'courier_to_client', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  const getStepStatus = (stepKey: string) => {
    const stepIndex = statusOrder.indexOf(stepKey);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const statusInfo = CLIENT_STATUS_DISPLAY[status as keyof typeof CLIENT_STATUS_DISPLAY];

  return (
    <View style={styles.statusProgressCard}>
      <Text style={styles.statusProgressTitle}>
        {statusInfo?.label || 'Статус заказа'}
      </Text>
      <Text style={styles.statusProgressDescription}>
        {statusInfo?.description || ''}
      </Text>
      
      <View style={styles.statusStepsContainer}>
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          const isLast = index === steps.length - 1;
          
          return (
            <View key={step.key} style={styles.statusStep}>
              {!isLast && (
                <View 
                  style={[
                    styles.statusStepLine,
                    stepStatus === 'completed' && styles.statusStepLineActive,
                  ]} 
                />
              )}
              <View 
                style={[
                  styles.statusStepDot,
                  stepStatus === 'active' && styles.statusStepDotActive,
                  stepStatus === 'completed' && styles.statusStepDotCompleted,
                ]}
              >
                {(stepStatus === 'active' || stepStatus === 'completed') && (
                  <View style={styles.statusStepDotInner} />
                )}
              </View>
              <View style={styles.statusStepContent}>
                <Text 
                  style={[
                    styles.statusStepLabel,
                    stepStatus === 'active' && styles.statusStepLabelActive,
                    stepStatus === 'completed' && styles.statusStepLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
                <Text style={styles.statusStepDescription}>
                  {step.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
