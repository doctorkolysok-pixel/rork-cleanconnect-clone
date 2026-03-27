import { useApp } from '@/contexts/AppContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Phone, Package, CheckCircle, Truck, Clock } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';

export default function DeliveryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deliveries, acceptDelivery, updateDeliveryStatus, user } = useApp();

  const delivery = deliveries.find(d => d.id === id);

  if (!delivery) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Доставка не найдена</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  const DELIVERY_TYPE_LABELS = {
    pickup_to_cleaner: 'Забрать у клиента',
    cleaner_to_client: 'Доставить клиенту',
  };

  const STATUS_LABELS = {
    new: 'Новая',
    accepted: 'Принята',
    picked_up: 'Забрал',
    in_transit: 'В пути',
    delivered: 'В точке',
    cancelled: 'Отменено',
  };

  const isMyDelivery = delivery.courierId === user.id;

  const handleAcceptDelivery = async () => {
    Alert.alert(
      'Принять доставку?',
      `Вы получите ${delivery.estimatedPrice} ₸ после завершения.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Принять',
          onPress: async () => {
            await acceptDelivery(delivery.id);
            Alert.alert('Успешно!', 'Вы приняли доставку');
          },
        },
      ]
    );
  };

  const handlePickedUp = async () => {
    Alert.alert('Подтвердить забор?', 'Вы забрали вещи?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Да, забрал',
        onPress: async () => {
          await updateDeliveryStatus(delivery.id, 'picked_up');
          Alert.alert('Отлично!', 'Теперь отметьте когда будете в пути');
        },
      },
    ]);
  };

  const handleInTransit = async () => {
    await updateDeliveryStatus(delivery.id, 'in_transit');
    Alert.alert('В пути!', 'Клиент получил уведомление');
  };

  const handleDelivered = async () => {
    Alert.alert('Подтвердить доставку?', 'Вы доставили вещи?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Да, доставил',
        onPress: async () => {
          await updateDeliveryStatus(delivery.id, 'delivered');
          Alert.alert('Поздравляем!', `Вы получили ${delivery.estimatedPrice} ₸ и 30 баллов`, [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
      },
    ]);
  };

  const handleCallClient = () => {
    Linking.openURL(`tel:${delivery.clientPhone}`);
  };

  const handleCallCleaner = () => {
    if (delivery.cleanerPhone) {
      Linking.openURL(`tel:${delivery.cleanerPhone}`);
    }
  };

  const handleOpenMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Детали доставки</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={[styles.typeBadge, { backgroundColor: delivery.type === 'pickup_to_cleaner' ? '#FF9800' : '#00BFA6' }]}>
            <Package color="#fff" size={20} />
            <Text style={styles.typeBadgeText}>{DELIVERY_TYPE_LABELS[delivery.type]}</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Статус</Text>
            <Text style={styles.statusValue}>{STATUS_LABELS[delivery.status]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Маршрут</Text>

          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={styles.routeDot} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Откуда</Text>
                <Text style={styles.routeAddress}>{delivery.pickupAddress}</Text>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => handleOpenMap(delivery.pickupAddress)}
                >
                  <MapPin size={16} color="#00BFA6" />
                  <Text style={styles.mapButtonText}>Открыть на карте</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: '#00BFA6' }]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Куда</Text>
                <Text style={styles.routeAddress}>{delivery.deliveryAddress}</Text>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => handleOpenMap(delivery.deliveryAddress)}
                >
                  <MapPin size={16} color="#00BFA6" />
                  <Text style={styles.mapButtonText}>Открыть на карте</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контакты</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleCallClient}>
            <View style={styles.contactIcon}>
              <Phone color="#00BFA6" size={20} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Клиент</Text>
              <Text style={styles.contactPhone}>{delivery.clientPhone}</Text>
            </View>
            <Text style={styles.contactAction}>Позвонить</Text>
          </TouchableOpacity>

          {delivery.cleanerPhone && (
            <TouchableOpacity style={styles.contactCard} onPress={handleCallCleaner}>
              <View style={styles.contactIcon}>
                <Phone color="#00BFA6" size={20} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Химчистка</Text>
                <Text style={styles.contactPhone}>{delivery.cleanerPhone}</Text>
              </View>
              <Text style={styles.contactAction}>Позвонить</Text>
            </TouchableOpacity>
          )}
        </View>

        {delivery.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Примечания</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{delivery.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Оплата</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Стоимость доставки</Text>
            <Text style={styles.priceValue}>{delivery.estimatedPrice} ₸</Text>
          </View>
        </View>

        {delivery.pickupTime && (
          <View style={styles.section}>
            <View style={styles.timelineItem}>
              <Clock size={16} color="#999" />
              <Text style={styles.timelineText}>
                Забрано: {new Date(delivery.pickupTime).toLocaleString('ru-RU')}
              </Text>
            </View>
          </View>
        )}

        {delivery.deliveryTime && (
          <View style={styles.section}>
            <View style={styles.timelineItem}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.timelineText}>
                Доставлено: {new Date(delivery.deliveryTime).toLocaleString('ru-RU')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {!isMyDelivery && delivery.status === 'new' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptDelivery}>
            <Text style={styles.acceptButtonText}>Принять доставку</Text>
            <Text style={styles.acceptButtonPrice}>{delivery.estimatedPrice} ₸</Text>
          </TouchableOpacity>
        </View>
      )}

      {isMyDelivery && delivery.status === 'accepted' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePickedUp}>
            <Package color="#fff" size={20} />
            <Text style={styles.actionButtonText}>Забрал</Text>
          </TouchableOpacity>
        </View>
      )}

      {isMyDelivery && delivery.status === 'picked_up' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleInTransit}>
            <Truck color="#fff" size={20} />
            <Text style={styles.actionButtonText}>В пути</Text>
          </TouchableOpacity>
        </View>
      )}

      {isMyDelivery && delivery.status === 'in_transit' && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={handleDelivered}>
            <CheckCircle color="#fff" size={20} />
            <Text style={styles.actionButtonText}>В точке</Text>
          </TouchableOpacity>
        </View>
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  statusCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginTop: 4,
    marginRight: 16,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#ddd',
    marginLeft: 5,
    marginVertical: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  contactAction: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  notesCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  priceCard: {
    backgroundColor: '#E8F5F3',
    padding: 16,
    borderRadius: 12,
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
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  acceptButtonPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
