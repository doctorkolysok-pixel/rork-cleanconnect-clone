import { useApp } from '@/contexts/AppContext';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Camera, StopCircle, Video, ArrowLeft, AlertCircle } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LiveStreamBroadcasterScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, startLiveStream, stopLiveStream, updateStreamFrame } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (streamId && isStreaming) {
        stopLiveStream(streamId);
      }
    };
  }, [streamId, isStreaming]);

  const handleStartStreaming = async () => {
    if (!order?.chosenCleanerId) {
      Alert.alert('Ошибка', 'Клинер не назначен для этого заказа');
      return;
    }

    try {
      const stream = await startLiveStream(orderId || '', order.chosenCleanerId);
      setStreamId(stream.id);
      setIsStreaming(true);

      captureIntervalRef.current = setInterval(async () => {
        await captureAndSendFrame(stream.id);
      }, 3000);

      Alert.alert('Успешно', 'Трансляция началась');
    } catch (error) {
      console.error('Error starting stream:', error);
      Alert.alert('Ошибка', 'Не удалось начать трансляцию');
    }
  };

  const handleStopStreaming = () => {
    Alert.alert(
      'Остановить трансляцию?',
      'Клиент больше не сможет видеть процесс работы',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Остановить',
          style: 'destructive',
          onPress: async () => {
            if (captureIntervalRef.current) {
              clearInterval(captureIntervalRef.current);
              captureIntervalRef.current = null;
            }
            if (streamId) {
              await stopLiveStream(streamId);
            }
            setIsStreaming(false);
            setStreamId(null);
          },
        },
      ]
    );
  };

  const captureAndSendFrame = async (currentStreamId: string) => {
    try {
      if (cameraRef.current && Platform.OS !== 'web') {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });

        if (photo?.base64) {
          const base64Data = `data:image/jpeg;base64,${photo.base64}`;
          await updateStreamFrame(currentStreamId, base64Data);
        }
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionHeader}>
          <TouchableOpacity style={styles.permissionBackButton} onPress={() => router.back()}>
            <ArrowLeft color="#1E1E1E" size={24} />
          </TouchableOpacity>
          <Text style={styles.permissionHeaderTitle}>Доступ к камере</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.permissionContainer}>
          <Camera color="#00BFA6" size={64} />
          <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
          <Text style={styles.permissionText}>
            Для начала трансляции необходимо разрешить доступ к камере
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={async () => {
              const result = await requestPermission();
              if (!result.granted) {
                Alert.alert(
                  'Доступ не предоставлен',
                  'Пожалуйста, разрешите доступ к камере в настройках приложения',
                  [
                    { text: 'OK', style: 'cancel' },
                  ]
                );
              }
            }}
          >
            <Text style={styles.permissionButtonText}>Разрешить доступ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.topGradient}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              {isStreaming && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>В ЭФИРЕ</Text>
                </View>
              )}
              <TouchableOpacity style={styles.flipButton} onPress={toggleCamera}>
                <Camera color="#fff" size={24} />
              </TouchableOpacity>
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
        </CameraView>
      </View>

      <View style={styles.controlsPanel}>
        {!isStreaming ? (
          <>
            <View style={styles.infoCard}>
              <AlertCircle color="#00BFA6" size={24} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Трансляция процесса уборки</Text>
                <Text style={styles.infoText}>
                  Клиент сможет видеть ваш прогресс в реальном времени
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStartStreaming}>
              <Video color="#fff" size={24} />
              <Text style={styles.startButtonText}>Начать трансляцию</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.streamingCard}>
              <View style={styles.streamingHeader}>
                <View style={styles.streamingIndicator}>
                  <View style={styles.streamingDot} />
                  <Text style={styles.streamingTitle}>Трансляция активна</Text>
                </View>
              </View>
              <Text style={styles.streamingText}>
                Клиент видит процесс работы в реальном времени
              </Text>
            </View>

            <TouchableOpacity style={styles.stopButton} onPress={handleStopStreaming}>
              <StopCircle color="#fff" size={24} />
              <Text style={styles.stopButtonText}>Остановить трансляцию</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Советы:</Text>
          <Text style={styles.tipItem}>• Закрепите телефон на груди или поясе</Text>
          <Text style={styles.tipItem}>• Убедитесь в стабильном интернет-соединении</Text>
          <Text style={styles.tipItem}>• Показывайте процесс работы, а не лица людей</Text>
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
  cameraContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.33,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
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
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
  controlsPanel: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  startButton: {
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
  startButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  streamingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
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
  streamingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
  },
  streamingTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  streamingText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
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
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  permissionBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
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
});
