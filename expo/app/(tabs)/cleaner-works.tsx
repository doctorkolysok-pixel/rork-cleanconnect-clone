import { useApp } from '@/contexts/AppContext';
import { CATEGORIES, STATUS_LABELS } from '@/constants/categories';
import { router } from 'expo-router';
import { ChevronRight, Package } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';

export default function CleanerWorksScreen() {
  const { user, orders } = useApp();

  if (user.role !== 'cleaner') {
    return null;
  }

  const completedWorks = orders.filter(o => 
    o.status === 'completed' && o.chosenCleanerId === 'cleaner-1'
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои работы</Text>
        <Text style={styles.headerSubtitle}>
          Завершено работ: {completedWorks.length}
        </Text>
      </View>

      {completedWorks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color="#ccc" size={64} />
          <Text style={styles.emptyTitle}>Нет завершённых работ</Text>
          <Text style={styles.emptyText}>
            Завершённые заказы появятся здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedWorks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const category = CATEGORIES.find(c => c.id === item.category);
            return (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/order/${item.id}` as any)}
              >
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
                  <Text style={styles.orderCategory}>{category?.titleRu}</Text>
                  <Text style={styles.orderComment} numberOfLines={2}>
                    {item.comment}
                  </Text>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderPrice}>{item.priceOffer} ₸</Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>
                        {STATUS_LABELS[item.status]}
                      </Text>
                    </View>
                  </View>
                  {item.completedAt && (
                    <Text style={styles.completedDate}>
                      Завершено: {new Date(item.completedAt).toLocaleDateString('ru-RU')}
                    </Text>
                  )}
                </View>
                <ChevronRight color="#ccc" size={20} />
              </TouchableOpacity>
            );
          }}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 16,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  orderImageContainer: {
    marginRight: 12,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
  orderCategory: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
    marginBottom: 4,
  },
  orderComment: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  completedDate: {
    fontSize: 12,
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
