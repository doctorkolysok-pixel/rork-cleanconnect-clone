import { useApp, useOrderLiveStream } from '@/contexts/AppContext';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Video, Eye, WifiOff, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LiveStreamViewerScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, incrementViewerCount } = useApp();
  const liveStream = useOrderLiveStream(orderId || '');
  const [isBuffering, setIsBuffering] = useState(true);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (liveStream) {
      incrementViewerCount(liveStream.id);
      const timer = setTimeout(() => setIsBuffering(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [liveStream?.id]);

  useEffect(() => {
    if (liveStream?.currentFrame) {
      setIsBuffering(true);
      const timer = setTimeout(() => setIsBuffering(false), 300);
      return () => clearTimeout(timer);
    }
  }, [liveStream?.currentFrame]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  if (!liveStream) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Трансляция</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.noStreamContainer}>
          <WifiOff color="#999" size={64} />
          <Text style={styles.noStreamTitle}>Трансляция не активна</Text>
          <Text style={styles.noStreamText}>
            Исполнитель пока не начал трансляцию работы
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.videoContainer}>
        {liveStream.currentFrame ? (
          <>
            <Image
              source={{ uri: liveStream.currentFrame }}
              style={styles.videoFrame}
              contentFit="cover"
              transition={200}
            />
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderVideo}>
            <ActivityIndicator size="large" color="#00BFA6" />
            <Text style={styles.placeholderText}>Подключение к трансляции...</Text>
          </View>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.topGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>В ЭФИРЕ</Text>
            </View>
            <View style={styles.viewerBadge}>
              <Eye color="#fff" size={16} />
              <Text style={styles.viewerCount}>{liveStream.viewerCount}</Text>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        >
          <View style={styles.bottomInfo}>
            <View style={styles.orderInfo}>
              <Video color="#fff" size={20} />
              <Text style={styles.orderTitle}>{order.comment}</Text>
            </View>
            <Text style={styles.orderAddress}>{order.address}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Статус:</Text>
            <Text style={styles.infoValue}>Уборка в процессе</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Началась:</Text>
            <Text style={styles.infoValue}>
              {liveStream.startedAt
                ? new Date(liveStream.startedAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'}
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Совет</Text>
            <Text style={styles.tipText}>
              Вы можете отслеживать работу исполнителя в реальном времени
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.33,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoFrame: {
    width: '100%',
    height: '100%',
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  placeholderVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    gap: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewerCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  bottomInfo: {
    gap: 8,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    flex: 1,
  },
  orderAddress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  infoPanel: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  tipCard: {
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noStreamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  noStreamTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  noStreamText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
