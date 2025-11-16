import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import { Order } from '@/types';
import { router } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Package, Sparkles } from 'lucide-react-native';
import React, { useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';

export default function CleanerOrdersScreen() {
  const { orders } = useApp();
  const availableOrdersQuery = trpc.orders.getAvailableOrders.useQuery();

  useEffect(() => {
    if (availableOrdersQuery.data) {
      console.log('Available orders from DB:', availableOrdersQuery.data.length);
    }
  }, [availableOrdersQuery.data]);

  const availableOrders = useMemo(() => {
    if (availableOrdersQuery.data && availableOrdersQuery.data.length > 0) {
      console.log('Using orders from database');
      return availableOrdersQuery.data.map(order => ({
        ...order,
        category: order.category as any,
        urgency: order.urgency as any,
        status: order.status as any,
      }));
    }
    console.log('Using orders from local state:', orders.length);
    return orders.filter(order => 
      order.status === 'new' || order.status === 'offers_received'
    );
  }, [availableOrdersQuery.data, orders]);

  const renderDifficultyBadge = (difficulty?: 'easy' | 'medium' | 'hard') => {
    if (!difficulty) return null;
    
    const colors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336',
    };
    
    const labels = {
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно',
    };
    
    return (
      <View style={[styles.difficultyBadge, { backgroundColor: colors[difficulty] }]}>
        <Text style={styles.difficultyText}>{labels[difficulty]}</Text>
      </View>
    );
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const category = CATEGORIES.find(c => c.id === item.category);
    const hasAiAnalysis = item.aiAnalysis && 'stainType' in item.aiAnalysis;
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/cleaner/order-details/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderImageContainer}>
            {item.photos[0] ? (
              <Image
                source={{ uri: item.photos[0] }}
                style={styles.orderImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.orderImagePlaceholder, { backgroundColor: category?.color }]}>
                <Text style={styles.orderImagePlaceholderText}>
                  {category?.titleRu[0]}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.orderTitleRow}>
              <Text style={styles.orderCategory}>{category?.titleRu}</Text>
              {hasAiAnalysis && renderDifficultyBadge(item.aiAnalysis?.difficulty)}
            </View>
            <Text style={styles.orderComment} numberOfLines={2}>
              {item.comment}
            </Text>
            <View style={styles.orderMetaRow}>
              <View style={styles.orderMetaItem}>
                <MapPin size={14} color="#999" />
                <Text style={styles.orderMetaText} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {hasAiAnalysis && item.aiAnalysis && 'stainType' in item.aiAnalysis && (
          <View style={styles.aiInfo}>
            <Sparkles size={16} color="#FFD700" />
            <Text style={styles.aiInfoText}>
              {item.aiAnalysis.stainType} • {item.aiAnalysis.fabricType}
            </Text>
          </View>
        )}

        <View style={styles.orderFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Предложено:</Text>
            <Text style={styles.priceValue}>{item.priceOffer} ₸</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#999" />
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Доступные заказы</Text>
          <Text style={styles.headerSubtitle}>{availableOrders.length} заказов</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {availableOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color="#ccc" size={64} />
          <Text style={styles.emptyTitle}>Нет доступных заказов</Text>
          <Text style={styles.emptyText}>
            Новые заказы появятся здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderOrderCard}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  list: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderImageContainer: {
    marginRight: 12,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  orderImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  orderCategory: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  orderComment: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  orderMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  orderMetaText: {
    fontSize: 13,
    color: '#999',
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: 12,
  },
  aiInfoText: {
    fontSize: 13,
    color: '#F57C00',
    fontWeight: '500' as const,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
