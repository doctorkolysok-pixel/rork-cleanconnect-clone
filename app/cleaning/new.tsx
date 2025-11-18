import { useApp } from '@/contexts/AppContext';
import { trpcVanillaClient } from '@/lib/trpc';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { Colors, Shadows, BorderRadius, Spacing, Typography } from '@/constants/colors';
import { Order, CleaningType, AccessType, CleaningOrderDetails, CategorizedPhoto, PhotoAngle } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import type { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from '@/backend/trpc/app-router';
import { Camera, Sparkles, Calendar, MapPin, Users, Home, Droplet, PawPrint, AlertCircle, X, Plus, Minus, Shield, TrendingUp, Loader2, CheckCircle } from 'lucide-react-native';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AVG_PRICES } from '@/constants/avgPrices';
import { calculateTazaIndex } from '@/constants/tazaIndex';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Animated,
  Modal,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const CLEANING_TYPES = [
  { value: 'apartment' as const, label: 'Уборка квартиры', icon: '🏠' },
  { value: 'office' as const, label: 'Уборка офиса', icon: '🏢' },
  { value: 'general' as const, label: 'Генеральная уборка', icon: '✨' },
  { value: 'after_construction' as const, label: 'Послестройка', icon: '🔨' },
  { value: 'event' as const, label: 'После мероприятия', icon: '🎉' },
  { value: 'windows' as const, label: 'Мытьё окон', icon: '🪟' },
];

const ACCESS_TYPES = [
  { value: 'present' as const, label: '🏠 Буду дома' },
  { value: 'leave_keys' as const, label: '🔑 Оставлю ключи' },
  { value: 'door_code' as const, label: '🔐 Код домофона' },
];

type CreateOrderInput = inferProcedureInput<AppRouter['orders']['create']>;

function resolveErrorMessage(message: string | null | undefined): string {
  if (!message) return 'Произошла неизвестная ошибка';
  if (message.includes('Failed to fetch')) {
    return 'Не удалось подключиться к серверу. Проверьте интернет.';
  }
  if (message.includes('JSON Parse error') || message.includes('Unexpected character')) {
    return 'Ошибка соединения с сервером. Убедитесь, что backend запущен.';
  }
  return message;
}

export default function NewCleaningOrderScreen() {
  const { user } = useApp();
  const createOrderMutation = useMutation({
    mutationKey: ['orders', 'create'],
    mutationFn: async (payload: CreateOrderInput) => {
      console.log('💾 Sending order payload to backend', payload);
      const response = await trpcVanillaClient.orders.create.mutate(payload);
      console.log('✅ Received order creation response', response);
      return response;
    },
  });
  
  const [categorizedPhotos, setCategorizedPhotos] = useState<CategorizedPhoto[]>([]);
  const [cleaningType, setCleaningType] = useState<CleaningType | null>(null);
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [hasPets, setHasPets] = useState(false);
  const [needsSupplies, setNeedsSupplies] = useState(false);
  const [preferredDateTime, setPreferredDateTime] = useState('');
  const [access, setAccess] = useState<AccessType>('present');
  const [doorCode, setDoorCode] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('Алматы, ул. Абая 150');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPriceAdjust, setShowPriceAdjust] = useState(false);
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [showTazaNotification, setShowTazaNotification] = useState(false);
  const previousTazaLevel = useRef<string>('optimal');
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const insets = useSafeAreaInsets();
  


  const analyzeImages = async (photos: CategorizedPhoto[]) => {
    console.log('🔍 Starting AI analysis...');
    setIsAnalyzing(true);
    
    try {
      const imageMessages = photos.map(photo => ({
        type: 'image' as const,
        image: photo.uri,
      }));

      const analysisSchema = z.object({
        roomType: z.enum(['apartment', 'office']).describe('Тип помещения'),
        dirtLevel: z.enum(['light', 'medium', 'heavy', 'extreme']).describe('Уровень загрязнения'),
        estimatedTimeHours: z.number().describe('Примерное время уборки в часах'),
        recommendedCleaners: z.number().describe('Рекомендуемое количество клинеров'),
        specialZones: z.array(z.string()).describe('Особые зоны требующие внимания'),
        recommendations: z.array(z.string()).describe('Рекомендации по уборке'),
        estimatedPrice: z.number().describe('Примерная стоимость в тенге'),
        confidence: z.number().min(0).max(100).describe('Уверенность анализа в процентах'),
      });

      console.log('📤 Sending to AI...');
      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Проанализируй фотографии помещения для уборки. Определи тип помещения, уровень загрязнения, примерное время работы, количество клинеров, специальные зоны и рекомендации. Дай оценку стоимости в тенге.',
              },
              ...imageMessages,
            ],
          },
        ],
        schema: analysisSchema,
      });

      console.log('✅ AI Analysis result:', result);
      setAiAnalysisResult(result);
      return result;
    } catch (error: any) {
      console.error('❌ AI Analysis error:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      console.error('Error stack:', error?.stack);
      
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('JSON Parse error') || errorMsg.includes('Unexpected character')) {
        console.error('⚠️ AI Toolkit endpoint returning non-JSON response. Check EXPO_PUBLIC_TOOLKIT_URL configuration.');
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImageForAngle = async (angle: PhotoAngle) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Нужно разрешение', 'Разрешите доступ к галерее для загрузки фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const labels: Record<PhotoAngle, string> = {
        general: 'Общий план',
        medium: 'Средний ракурс',
        detail: 'Детальный ракурс',
      };
      
      const newPhoto: CategorizedPhoto = {
        uri,
        angle,
        label: labels[angle],
      };
      
      const filtered = categorizedPhotos.filter(p => p.angle !== angle);
      const updatedPhotos = [...filtered, newPhoto];
      setCategorizedPhotos(updatedPhotos);
      
      if (updatedPhotos.length > 0) {
        analyzeImages(updatedPhotos).catch(err => {
          console.error('Background AI analysis failed:', err);
        });
      }
    }
  };

  const removePhoto = (angle: PhotoAngle) => {
    setCategorizedPhotos(prev => prev.filter(p => p.angle !== angle));
  };



  const calculateEstimatedPrice = useCallback((): number => {
    const basePrice = parseFloat(area) * 100 || 0;
    const suppliesCost = needsSupplies ? 300 : 0;
    return basePrice + suppliesCost;
  }, [area, needsSupplies]);

  const getFinalPrice = useCallback((): number => {
    return showPriceAdjust ? adjustedPrice : calculateEstimatedPrice();
  }, [adjustedPrice, calculateEstimatedPrice, showPriceAdjust]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const tazaIndexResult = useMemo(() => {
    const price = getFinalPrice();
    if (price === 0) {
      return calculateTazaIndex(AVG_PRICES['cleaning'], AVG_PRICES['cleaning']);
    }
    const avgPrice = AVG_PRICES['cleaning'];
    return calculateTazaIndex(price, avgPrice);
  }, [getFinalPrice]);

  useEffect(() => {
    if (getFinalPrice() > 0 && previousTazaLevel.current !== tazaIndexResult.level) {
      previousTazaLevel.current = tazaIndexResult.level;
      
      setShowTazaNotification(true);
      
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setShowTazaNotification(false);
      }, 3000);
    }

    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [borderColorAnim, getFinalPrice, pulseAnim, tazaIndexResult.level]);

  const increasePrice = () => {
    const currentPrice = getFinalPrice();
    setAdjustedPrice(currentPrice + 500);
    setShowPriceAdjust(true);
  };

  const decreasePrice = () => {
    const currentPrice = getFinalPrice();
    const newPrice = Math.max(500, currentPrice - 500);
    setAdjustedPrice(newPrice);
    setShowPriceAdjust(true);
  };

  const handleCreateOrder = async () => {
    console.log('=== Button pressed! ===');
    console.log('Photos:', categorizedPhotos.length);
    console.log('Cleaning type:', cleaningType);
    console.log('Area:', area);
    
    if (categorizedPhotos.length === 0) {
      console.log('Validation failed: No photos');
      setValidationError('Пожалуйста, загрузите хотя бы 1 фото помещения');
      return;
    }
    
    if (!cleaningType) {
      console.log('Validation failed: No cleaning type');
      setValidationError('Пожалуйста, выберите тип уборки');
      return;
    }
    
    if (!area || parseFloat(area) <= 0) {
      console.log('Validation failed: Invalid area');
      setValidationError('Пожалуйста, укажите площадь помещения');
      return;
    }

    console.log('✅ All validation passed, creating order...');
    setValidationError(null);
    
    const defaultDateTime = new Date();
    defaultDateTime.setHours(defaultDateTime.getHours() + 2);

    const cleaningDetails: CleaningOrderDetails = {
      type: cleaningType,
      area: parseFloat(area),
      rooms: parseInt(rooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      hasPets,
      needsSupplies,
      suppliesCost: needsSupplies ? 300 : 0,
      preferredDateTime: preferredDateTime || defaultDateTime.toISOString(),
      access,
      doorCode: access === 'door_code' ? doorCode : undefined,
      notes: notes.trim(),
    };

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: 'user-1',
      category: 'cleaning',
      photos: categorizedPhotos.map(p => p.uri),
      categorizedPhotos,
      comment: `${CLEANING_TYPES.find(t => t.value === cleaningType)?.label} - ${area} м²`,
      address,
      priceOffer: getFinalPrice(),
      urgency: 'standard',
      status: 'new',
      cleaningDetails,
      tazaIndex: {
        index: tazaIndexResult.index,
        level: tazaIndexResult.level,
        avgPrice: AVG_PRICES['cleaning'],
        protectionEnabled: tazaIndexResult.protectionEnabled,
      },
      createdAt: new Date().toISOString(),
    };

    console.log('📦 Creating order with backend...');
    
    try {
      if (!user || !user.id) {
        console.error('❌ User is not authenticated');
        Alert.alert('Ошибка', 'Необходимо войти в систему');
        return;
      }

      console.log('💾 Sending order to backend...');
      console.log('User ID:', user?.id);
      
      const result = await createOrderMutation.mutateAsync({
        userId: user.id,
        category: order.category,
        photos: order.photos,
        comment: order.comment,
        address: order.address,
        priceOffer: order.priceOffer,
        urgency: order.urgency,
        aiAnalysis: aiAnalysisResult,
        commission: order.tazaIndex,
      });
      
      console.log('✅ Order saved successfully!', result);
      createOrderMutation.reset();
      console.log('🚀 Navigating to:', `/order/${result.id}`);
      
      Alert.alert(
        'Заказ создан!',
        'Клинеры уже получают уведомления. +10 Clean Points',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Alert OK pressed, navigating...');
              router.push(`/order/${result.id}` as any);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error saving order:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        data: error?.data,
        shape: error?.shape,
        code: error?.code,
      });
      
      let errorMessage = resolveErrorMessage(error?.data?.message ?? error?.message ?? null);
      
      if (errorMessage.includes('Ошибка соединения с сервером')) {
        errorMessage += '\n\nПодсказка: Запустите backend командой "bun backend/hono.ts"';
      }
      
      Alert.alert('Ошибка', errorMessage);
    }
  };

  const friendlyMutationError = resolveErrorMessage(createOrderMutation.error?.message ?? null);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{ 
          title: 'Заказать уборку',
          headerStyle: { backgroundColor: Colors.cleaning },
          headerTintColor: Colors.textWhite,
          headerShadowVisible: false,
        }} 
      />
      
      <View style={styles.headerGradient}>
        <Text style={styles.headerSubtitle}>Загрузите фото помещения</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Фото помещения по ракурсам</Text>
          <Text style={styles.sectionHint}>Загрузите фото с разных ракурсов для точной оценки</Text>
          
          <View style={styles.anglePhotosContainer}>
            {(['general', 'medium', 'detail'] as PhotoAngle[]).map((angle) => {
              const photo = categorizedPhotos.find(p => p.angle === angle);
              const labels: Record<PhotoAngle, string> = {
                general: 'Общий план',
                medium: 'Средний ракурс',
                detail: 'Детальный ракурс',
              };
              const icons: Record<PhotoAngle, string> = {
                general: '🏠',
                medium: '📐',
                detail: '🔍',
              };
              
              return (
                <View key={angle} style={styles.anglePhotoCard}>
                  <View style={styles.anglePhotoHeader}>
                    <Text style={styles.anglePhotoIcon}>{icons[angle]}</Text>
                    <Text style={styles.anglePhotoLabel}>{labels[angle]}</Text>
                  </View>
                  
                  {photo ? (
                    <View style={styles.anglePhotoImageContainer}>
                      <Image source={{ uri: photo.uri }} style={styles.anglePhotoImage} contentFit="cover" />
                      <TouchableOpacity 
                        style={styles.removeAnglePhotoButton} 
                        onPress={() => removePhoto(angle)}
                      >
                        <X color={Colors.textWhite} size={14} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.anglePhotoPlaceholder} 
                      onPress={() => pickImageForAngle(angle)}
                    >
                      <Camera color={Colors.cleaning} size={24} strokeWidth={1.5} />
                      <Text style={styles.anglePhotoPlaceholderText}>Добавить</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
          
          {isAnalyzing && (
            <View style={styles.analysisLoading}>
              <Loader2 color={Colors.cleaning} size={20} strokeWidth={2.5} />
              <Text style={styles.analysisLoadingText}>Анализируем изображения...</Text>
            </View>
          )}

          {aiAnalysisResult && !isAnalyzing && (
            <View style={styles.aiResultCard}>
              <View style={styles.aiResultHeader}>
                <CheckCircle color={Colors.cleaning} size={20} strokeWidth={2.5} />
                <Text style={styles.aiResultTitle}>AI Анализ</Text>
              </View>
              <View style={styles.aiResultContent}>
                <View style={styles.aiResultRow}>
                  <Text style={styles.aiResultLabel}>Уровень загрязнения:</Text>
                  <Text style={styles.aiResultValue}>{aiAnalysisResult.dirtLevel}</Text>
                </View>
                <View style={styles.aiResultRow}>
                  <Text style={styles.aiResultLabel}>Примерное время:</Text>
                  <Text style={styles.aiResultValue}>{aiAnalysisResult.estimatedTimeHours} часов</Text>
                </View>
                <View style={styles.aiResultRow}>
                  <Text style={styles.aiResultLabel}>Рекомендуемо клинеров:</Text>
                  <Text style={styles.aiResultValue}>{aiAnalysisResult.recommendedCleaners}</Text>
                </View>
                {aiAnalysisResult.specialZones && aiAnalysisResult.specialZones.length > 0 && (
                  <View style={styles.aiResultFullRow}>
                    <Text style={styles.aiResultLabel}>Особые зоны:</Text>
                    <Text style={styles.aiResultValueText}>{aiAnalysisResult.specialZones.join(', ')}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧹 Тип уборки</Text>
          <View style={styles.typesGrid}>
            {CLEANING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeChip,
                  cleaningType === type.value && styles.typeChipActive,
                ]}
                onPress={() => setCleaningType(type.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeChipIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeChipText,
                  cleaningType === type.value && styles.typeChipTextActive,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Площадь помещения</Text>
          <View style={styles.inputCard}>
            <Home color={Colors.cleaning} size={22} strokeWidth={1.5} />
            <TextInput
              style={styles.input}
              placeholder="Например: 65"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={area}
              onChangeText={setArea}
            />
            <Text style={styles.inputSuffix}>м²</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛏️ Комнаты и санузлы</Text>
          <View style={styles.row}>
            <View style={[styles.inputCard, styles.halfWidth]}>
              <Users color={Colors.cleaning} size={22} strokeWidth={1.5} />
              <TextInput
                style={styles.input}
                placeholder="Комнат"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={rooms}
                onChangeText={setRooms}
              />
            </View>
            <View style={[styles.inputCard, styles.halfWidth]}>
              <Droplet color={Colors.cleaning} size={22} strokeWidth={1.5} />
              <TextInput
                style={styles.input}
                placeholder="Санузлов"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={bathrooms}
                onChangeText={setBathrooms}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchCard}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconCircle}>
                <PawPrint color={Colors.cleaning} size={20} strokeWidth={1.5} />
              </View>
              <Text style={styles.switchText}>Есть животные?</Text>
            </View>
            <Switch
              value={hasPets}
              onValueChange={setHasPets}
              trackColor={{ false: Colors.divider, true: Colors.cleaning }}
              thumbColor={Colors.textWhite}
              ios_backgroundColor={Colors.divider}
            />
          </View>
          {hasPets && (
            <View style={styles.warningBox}>
              <AlertCircle color={Colors.warning} size={18} strokeWidth={2} />
              <Text style={styles.warningText}>
                Клинер может запросить доплату за работу с шерстью
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.switchCard}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconCircle}>
                <Sparkles color={Colors.cleaning} size={20} strokeWidth={1.5} />
              </View>
              <Text style={styles.switchText}>Клинер привезёт средства?</Text>
            </View>
            <Switch
              value={needsSupplies}
              onValueChange={setNeedsSupplies}
              trackColor={{ false: Colors.divider, true: Colors.cleaning }}
              thumbColor={Colors.textWhite}
              ios_backgroundColor={Colors.divider}
            />
          </View>
          {needsSupplies && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>+ 300 ₸ за средства</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 Желаемое время</Text>
          <View style={styles.inputCard}>
            <Calendar color={Colors.cleaning} size={22} strokeWidth={1.5} />
            <TextInput
              style={styles.input}
              placeholder="Например: завтра в 14:00"
              placeholderTextColor={Colors.textSecondary}
              value={preferredDateTime}
              onChangeText={setPreferredDateTime}
            />
          </View>
          <Text style={styles.hintText}>По умолчанию: через 2 часа</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Доступ в помещение</Text>
          <View style={styles.accessGrid}>
            {ACCESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.accessChip,
                  access === type.value && styles.accessChipActive,
                ]}
                onPress={() => setAccess(type.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.accessChipText,
                  access === type.value && styles.accessChipTextActive,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {access === 'door_code' && (
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Введите код домофона"
                placeholderTextColor={Colors.textSecondary}
                value={doorCode}
                onChangeText={setDoorCode}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Адрес</Text>
          <View style={styles.inputCard}>
            <MapPin color={Colors.cleaning} size={22} strokeWidth={1.5} />
            <TextInput
              style={styles.input}
              placeholder="Введите адрес"
              placeholderTextColor={Colors.textSecondary}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Дополнительные пожелания</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Например: особое внимание кухне или балкону"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={300}
            value={notes}
            onChangeText={setNotes}
          />
          <Text style={[styles.charCount, notes.length > 250 && { color: Colors.warning }]}>
            {notes.length}/300
          </Text>
        </View>



        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.select({ ios: Spacing.xxxl, default: Spacing.xl }) + insets.bottom,
          },
        ]}
      >
        {createOrderMutation.isError && (
          <View style={styles.errorBox}>
            <AlertCircle color={Colors.error} size={20} strokeWidth={2} />
            <Text style={styles.errorText}>{friendlyMutationError}</Text>
          </View>
        )}
        {validationError && (
          <View style={styles.errorBox}>
            <AlertCircle color={Colors.error} size={20} strokeWidth={2} />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        <View style={styles.priceAdjustContainer}>
          <Text style={styles.footerPriceLabel}>Ваша цена за услугу</Text>
          <View style={styles.priceControl}>
            <TouchableOpacity 
              style={styles.priceButton}
              onPress={decreasePrice}
              activeOpacity={0.7}
            >
              <Minus color={Colors.cleaning} size={20} strokeWidth={2.5} />
            </TouchableOpacity>
            
            <Animated.View 
              style={[
                styles.priceDisplay,
                getFinalPrice() > 0 && {
                  borderColor: tazaIndexResult.color,
                  backgroundColor: tazaIndexResult.color + '10',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.footerPriceValue}>
                {getFinalPrice().toLocaleString('ru-KZ')} ₸
              </Text>
              {!showPriceAdjust && (
                <Text style={styles.priceHint}>Примерная стоимость</Text>
              )}
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.priceButton}
              onPress={increasePrice}
              activeOpacity={0.7}
            >
              <Plus color={Colors.cleaning} size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avgPriceHint}>
            Средняя цена: {AVG_PRICES['cleaning'].toLocaleString('ru-KZ')} ₸
          </Text>

          {getFinalPrice() > 0 && (
            <View style={[styles.tazaIndexFooterCard, { borderColor: tazaIndexResult.color }]}>
              <View style={styles.tazaIndexFooterHeader}>
                <View style={styles.tazaIndexFooterLeft}>
                  <TrendingUp color={tazaIndexResult.color} size={20} strokeWidth={2.5} />
                  <Text style={[styles.tazaIndexFooterTitle, { color: tazaIndexResult.color }]}>Taza Index</Text>
                </View>
                <View style={[styles.tazaIndexFooterBadge, { backgroundColor: tazaIndexResult.color + '20' }]}>
                  <Text style={styles.tazaIndexFooterEmoji}>{tazaIndexResult.emoji}</Text>
                  <Text style={[styles.tazaIndexFooterBadgeText, { color: tazaIndexResult.color }]}>
                    {tazaIndexResult.title}
                  </Text>
                  <Text style={[styles.tazaIndexFooterPercent, { color: tazaIndexResult.color }]}>
                    {tazaIndexResult.index}%
                  </Text>
                </View>
              </View>
              <Text style={styles.tazaIndexFooterDescription}>{tazaIndexResult.description}</Text>
              {tazaIndexResult.protectionEnabled && (
                <View style={styles.protectionFooterBox}>
                  <Shield color="#B8860B" size={14} strokeWidth={2} fill="#FFD700" />
                  <Text style={styles.protectionFooterText}>Premium Protection ✓</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.createButton,
            createOrderMutation.isPending && styles.createButtonDisabled,
          ]}
          onPress={handleCreateOrder}
          activeOpacity={0.7}
          disabled={createOrderMutation.isPending}
          testID="create-cleaning-order"
        >
          {createOrderMutation.isPending ? (
            <View style={styles.createButtonContent}>
              <Loader2 color={Colors.textWhite} size={18} strokeWidth={2.5} />
              <Text
                style={[
                  styles.createButtonText,
                  styles.createButtonTextDisabled,
                ]}
              >
                Создаем заказ...
              </Text>
            </View>
          ) : (
            <Text style={styles.createButtonText}>Найти исполнителя</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTazaNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTazaNotification(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.notificationCard, { borderLeftColor: tazaIndexResult.color }]}>
            <View style={[styles.notificationIconCircle, { backgroundColor: tazaIndexResult.color + '20' }]}>
              <Text style={styles.notificationEmoji}>{tazaIndexResult.emoji}</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: tazaIndexResult.color }]}>
                {tazaIndexResult.title}
              </Text>
              <Text style={styles.notificationDescription}>
                {tazaIndexResult.description}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationClose}
              onPress={() => setShowTazaNotification(false)}
            >
              <X color={Colors.textSecondary} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerGradient: {
    backgroundColor: Colors.cleaning,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.small,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textWhite,
    opacity: 0.95,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.heading4,
    marginBottom: Spacing.xs,
  },
  sectionHint: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
  photosScroll: {
    marginVertical: Spacing.md,
  },
  photosContent: {
    paddingRight: Spacing.xl,
  },
  mainPhotoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.large,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.cleaning,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    ...Shadows.small,
  },
  photoIconCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  photoPlaceholderTitle: {
    ...Typography.bodyBold,
    color: Colors.cleaning,
    marginBottom: Spacing.xs,
  },
  photoPlaceholderSubtitle: {
    ...Typography.small,
    textAlign: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  photoThumb: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.large,
    backgroundColor: Colors.backgroundCard,
  },
  removePhotoButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  addPhotoButton: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.large,
    borderWidth: 2,
    borderColor: Colors.cleaning,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
  },
  addPhotoText: {
    ...Typography.captionBold,
    color: Colors.cleaning,
    marginTop: Spacing.sm,
  },

  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xlarge,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  typeChipActive: {
    backgroundColor: Colors.cleaning,
    borderColor: Colors.cleaning,
    ...Shadows.medium,
  },
  typeChipIcon: {
    fontSize: 18,
  },
  typeChipText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  typeChipTextActive: {
    color: Colors.textWhite,
    fontWeight: '600' as const,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
    ...Shadows.small,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.lg,
  },
  inputSuffix: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadows.small,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  switchIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    ...Typography.body,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    flex: 1,
  },
  infoBox: {
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.sm,
  },
  infoText: {
    ...Typography.captionBold,
    color: Colors.cleaning,
  },
  hintText: {
    ...Typography.small,
    marginTop: Spacing.sm,
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  accessChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xlarge,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    ...Shadows.small,
  },
  accessChipActive: {
    backgroundColor: Colors.cleaning,
    borderColor: Colors.cleaning,
    ...Shadows.medium,
  },
  accessChipText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  accessChipTextActive: {
    color: Colors.textWhite,
    fontWeight: '600' as const,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    ...Typography.body,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  charCount: {
    ...Typography.small,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  analysisLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cleaning,
    ...Shadows.small,
  },
  analysisLoadingText: {
    ...Typography.body,
    color: Colors.cleaning,
    fontWeight: '600' as const,
  },
  aiResultCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.cleaning,
    ...Shadows.medium,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  aiResultTitle: {
    ...Typography.bodyBold,
    color: Colors.cleaning,
    fontSize: 16,
  },
  aiResultContent: {
    gap: Spacing.sm,
  },
  aiResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  aiResultLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  aiResultValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  aiResultFullRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: Spacing.sm,
  },
  aiResultValueText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  bottomSpacer: {
    height: 240,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
    fontWeight: '600' as const,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.select({ ios: Spacing.xxxl, default: Spacing.xl }),
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Shadows.large,
  },
  priceAdjustContainer: {
    marginBottom: Spacing.lg,
  },
  footerPriceLabel: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  priceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  priceButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.cleaning,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  priceDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    maxWidth: 200,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.cleaning,
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.md,
    zIndex: 1,
  },
  footerPriceValue: {
    ...Typography.heading3,
    color: Colors.cleaning,
    textAlign: 'center',
  },
  priceHint: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  createButton: {
    backgroundColor: Colors.cleaning,
    borderRadius: BorderRadius.large,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    ...Shadows.medium,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  createButtonDisabled: {
    backgroundColor: Colors.divider,
  },
  createButtonText: {
    ...Typography.bodyBold,
    color: Colors.textWhite,
  },
  createButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  tazaIndexCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.large,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    ...Shadows.large,
  },
  tazaIndexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tazaIndexTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tazaIndexTitle: {
    ...Typography.bodyBold,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  tazaIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xlarge,
  },
  tazaIndexEmoji: {
    fontSize: 16,
  },
  tazaIndexBadgeText: {
    ...Typography.captionBold,
    fontSize: 13,
  },
  tazaIndexBar: {
    height: 32,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
  },
  tazaIndexBarFill: {
    height: '100%',
    borderRadius: BorderRadius.medium,
    minWidth: '2%',
  },
  tazaIndexValueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tazaIndexValue: {
    ...Typography.captionBold,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  tazaIndexDescription: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
  protectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  protectionText: {
    ...Typography.captionBold,
    color: '#B8860B',
    flex: 1,
    fontSize: 13,
  },
  avgPriceHint: {
    ...Typography.small,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  tazaIndexFooterCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 2,
    ...Shadows.small,
  },
  tazaIndexFooterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tazaIndexFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tazaIndexFooterTitle: {
    ...Typography.captionBold,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tazaIndexFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.large,
  },
  tazaIndexFooterEmoji: {
    fontSize: 12,
  },
  tazaIndexFooterBadgeText: {
    ...Typography.small,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tazaIndexFooterPercent: {
    ...Typography.small,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  tazaIndexFooterDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  protectionFooterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: Spacing.xs,
    borderRadius: BorderRadius.small,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  protectionFooterText: {
    ...Typography.small,
    color: '#B8860B',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    ...Shadows.large,
    borderLeftWidth: 4,
    gap: Spacing.md,
  },
  notificationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  notificationDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notificationClose: {
    padding: Spacing.xs,
  },
  anglePhotosContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  anglePhotoCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadows.small,
  },
  anglePhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  anglePhotoIcon: {
    fontSize: 16,
  },
  anglePhotoLabel: {
    ...Typography.small,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  anglePhotoImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
  },
  anglePhotoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundCard,
  },
  removeAnglePhotoButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anglePhotoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.medium,
    borderWidth: 2,
    borderColor: Colors.cleaning,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    gap: Spacing.xs,
  },
  anglePhotoPlaceholderText: {
    ...Typography.small,
    color: Colors.cleaning,
    fontWeight: '600' as const,
  },
});
