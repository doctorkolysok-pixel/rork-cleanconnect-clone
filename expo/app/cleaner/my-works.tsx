import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import { Order } from '@/types';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, MessageCircle, Package, Video } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';

export default function CleanerActiveWorksScreen() {
  const { orders, user } = useApp();

  const myActiveWorks = useMemo(() => {
    return orders.filter(
      order =>
        order.status === 'in_progress' &&
        order.chosenCleanerId === user.id
    );
  }, [orders, user.id]);

  const renderWorkCard = ({ item }: { item: Order }) => {
    const category = CATEGORIES.find(c => c.id === item.category);
    
    return (
      <View style={styles.workCard}>
        <View style={styles.workHeader}>
          <View style={styles.workImageContainer}>
            {item.photos[0] ? (
              <Image
                source={{ uri: item.photos[0] }}
                style={styles.workImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.workImagePlaceholder, { backgroundColor: category?.color }]}>
                <Text style={styles.workImagePlaceholderText}>
                  {category?.titleRu[0]}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.workInfo}>
            <Text style={styles.workCategory}>{category?.titleRu}</Text>
            <Text style={styles.workComment} numberOfLines={2}>
              {item.comment}
            </Text>
            <Text style={styles.workPrice}>{item.priceOffer} ₸</Text>
          </View>
        </View>

        <View style={styles.workActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <MessageCircle size={18} color="#00BFA6" />
            <Text style={styles.actionButtonText}>Чат</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/broadcast/${item.id}`)}
          >
            <Video size={18} color="#FF4081" />
            <Text style={styles.actionButtonText}>Трансляция</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => router.push(`/order/${item.id}`)}
          >
            <ChevronRight size={18} color="#666" />
            <Text style={[styles.actionButtonText, { color: '#666' }]}>Детали</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Активные работы</Text>
          <Text style={styles.headerSubtitle}>{myActiveWorks.length} заказов</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {myActiveWorks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color="#ccc" size={64} />
          <Text style={styles.emptyTitle}>Нет активных работ</Text>
          <Text style={styles.emptyText}>
            Принятые заказы появятся здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={myActiveWorks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderWorkCard}
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
  workCard: {
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
  workHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  workImageContainer: {
    marginRight: 12,
  },
  workImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  workImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  workInfo: {
    flex: 1,
  },
  workCategory: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
    marginBottom: 4,
  },
  workComment: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  workPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  workActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  detailsButton: {
    flex: 0.7,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
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
