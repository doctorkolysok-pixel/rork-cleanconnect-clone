import { useApp, useActiveOrders, useCompletedOrders } from '../../contexts/AppContext';
import { CATEGORIES, STATUS_LABELS, CLIENT_STATUS_DISPLAY } from '../../constants/categories';
import { router } from 'expo-router';
import { ChevronRight, Package, MapPin, Clock, ShoppingBag, Sparkles } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';

type TabType = 'active' | 'completed';

export default function OrdersScreen() {
  const { user } = useApp();

  if (user.role === 'cleaner') {
    return <CleanerOrdersTab />;
  }

  if (user.role === 'courier') {
    return <CourierOrdersTab />;
  }

  return <ClientOrdersTab />;
}

function ClientOrdersTab() {
  const [selectedTab, setSelectedTab] = useState<TabType>('active');
  const activeOrders = useActiveOrders();
  const completedOrders = useCompletedOrders();

  const orders = selectedTab === 'active' ? activeOrders : completedOrders;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои заказы</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
            Активные ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            Завершённые ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package color="#ccc" size={64} />
          <Text style={styles.emptyTitle}>Нет заказов</Text>
          <Text style={styles.emptyText}>
            {selectedTab === 'active'
              ? 'Создайте свой первый заказ'
              : 'Здесь будут завершённые заказы'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const category = CATEGORIES.find(c => c.id === item.category);
            return (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/order/${item.id}`)}
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
                    <Text style={[styles.orderStatus, { color: CLIENT_STATUS_DISPLAY[item.status as keyof typeof CLIENT_STATUS_DISPLAY]?.color || '#00BFA6' }]}>
                      {CLIENT_STATUS_DISPLAY[item.status as keyof typeof CLIENT_STATUS_DISPLAY]?.label || STATUS_LABELS[item.status]}
                    </Text>
                  </View>
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
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00BFA6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#999',
  },
  tabTextActive: {
    color: '#00BFA6',
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
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  orderMetaText: {
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
  utilityContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  utilityCard: {
    borderRadius: 18,
    backgroundColor: '#0F4037',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F4037',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  utilityCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  utilityIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14C6A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityTextGroup: {
    flex: 1,
    gap: 6,
  },
  utilityTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  utilitySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.82)',
  },
  utilityActionButton: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#14C6A4',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityActionButtonDisabled: {
    backgroundColor: 'rgba(20,198,164,0.4)',
  },
  utilityActionText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  utilityFeedback: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  utilityFeedbackSuccess: {
    color: '#96F0D4',
  },
  utilityFeedbackError: {
    color: '#FFB4B4',
  },
});

function CleanerOrdersTab() {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<'available' | 'my-orders'>('available');

  const availableOrders = orders.filter(o => 
    o.status === 'new' || o.status === 'offers_received'
  );

  const myOrders = orders.filter(o => 
    o.status === 'in_progress' && o.chosenCleanerId === 'cleaner-1'
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Заказы химчистки</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Доступные ({availableOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-orders' && styles.tabActive]}
          onPress={() => setActiveTab('my-orders')}
        >
          <Text style={[styles.tabText, activeTab === 'my-orders' && styles.tabTextActive]}>
            Мои заказы ({myOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        availableOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color="#ccc" />
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
            renderItem={({ item }) => {
              const category = CATEGORIES.find(c => c.id === item.category);
              return (
                <TouchableOpacity
                  style={styles.orderCard}
                  onPress={() => router.push(`/cleaner/order-details/${item.id}` as any)}
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
                      <Text style={[styles.orderStatus, { color: '#00BFA6' }]}>
                        {STATUS_LABELS[item.status]}
                      </Text>
                    </View>
                    <View style={styles.orderFooter}>
                      <MapPin size={12} color="#999" />
                      <Text style={styles.orderMetaText}>{item.address}</Text>
                    </View>
                  </View>
                  <ChevronRight color="#ccc" size={20} />
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : (
        myOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>У вас нет активных заказов</Text>
            <Text style={styles.emptyText}>
              Откликнитесь на заказы в разделе «Доступные»
            </Text>
          </View>
        ) : (
          <FlatList
            data={myOrders}
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
                      <Text style={[styles.orderStatus, { color: '#00BFA6' }]}>
                        {STATUS_LABELS[item.status]}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color="#ccc" size={20} />
                </TouchableOpacity>
              );
            }}
          />
        )
      )}
    </View>
  );
}

function CourierOrdersTab() {
  const { user, deliveries } = useApp();
  const [activeTab, setActiveTab] = useState<'available' | 'my-deliveries'>('available');

  const availableDeliveries = deliveries.filter(d => d.status === 'new');
  const myDeliveries = deliveries.filter(d => d.courierId === user.id && d.status !== 'delivered' && d.status !== 'cancelled');

  const DELIVERY_TYPE_LABELS = {
    pickup_to_cleaner: 'Забрать у клиента',
    cleaner_to_client: 'Доставить клиенту',
  };

  const STATUS_LABELS = {
    new: 'Новая',
    accepted: 'Принята',
    picked_up: 'Забрано',
    in_transit: 'В пути',
    delivered: 'Доставлено',
    cancelled: 'Отменено',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Доставки</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Доступные ({availableDeliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-deliveries' && styles.tabActive]}
          onPress={() => setActiveTab('my-deliveries')}
        >
          <Text style={[styles.tabText, activeTab === 'my-deliveries' && styles.tabTextActive]}>
            Мои ({myDeliveries.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        availableDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Нет доступных доставок</Text>
            <Text style={styles.emptyText}>
              Новые доставки появятся здесь
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableDeliveries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/delivery/${item.id}` as any)}
              >
                <View style={[styles.orderImagePlaceholder, { backgroundColor: '#FF9800', width: 60, height: 60 }]}>
                  <Package color="#fff" size={28} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderCategory}>{DELIVERY_TYPE_LABELS[item.type]}</Text>
                  <View style={styles.orderFooter}>
                    <MapPin size={12} color="#999" />
                    <Text style={styles.orderMetaText} numberOfLines={1}>
                      {item.type === 'pickup_to_cleaner' ? item.pickupAddress : item.deliveryAddress}
                    </Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderPrice}>{item.estimatedPrice} ₸</Text>
                    <Text style={[styles.orderStatus, { color: '#FF9800' }]}>
                      {STATUS_LABELS[item.status]}
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#ccc" size={20} />
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        myDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>У вас нет активных доставок</Text>
            <Text style={styles.emptyText}>
              Примите доставку в разделе «Доступные»
            </Text>
          </View>
        ) : (
          <FlatList
            data={myDeliveries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/delivery/${item.id}` as any)}
              >
                <View style={[styles.orderImagePlaceholder, { backgroundColor: '#00BFA6', width: 60, height: 60 }]}>
                  <Package color="#fff" size={28} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderCategory}>{DELIVERY_TYPE_LABELS[item.type]}</Text>
                  <View style={styles.orderFooter}>
                    <Clock size={12} color="#999" />
                    <Text style={styles.orderMetaText}>
                      {new Date(item.updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderPrice}>{item.estimatedPrice} ₸</Text>
                    <Text style={[styles.orderStatus, { color: '#00BFA6' }]}>
                      {STATUS_LABELS[item.status]}
                    </Text>
                  </View>
                </View>
                <ChevronRight color="#ccc" size={20} />
              </TouchableOpacity>
            )}
          />
        )
      )}
    </View>
  );
}
