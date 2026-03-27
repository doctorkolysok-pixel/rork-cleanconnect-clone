import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { CATEGORIES } from '@/constants/categories';
import { Order, OrderCategory, AIAnalysis, CategorizedPhoto, PhotoAngle } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Sparkles, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { AVG_PRICES } from '@/constants/avgPrices';
import { calculateTazaIndex, TazaIndexResult } from '@/constants/tazaIndex';
import { TrendingUp, Shield } from 'lucide-react-native';



export default function HomeScreen() {
  const { addOrder } = useApp();
  const createOrderMutation = trpc.orders.create.useMutation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [categorizedPhotos, setCategorizedPhotos] = useState<CategorizedPhoto[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [address, setAddress] = useState('Алматы, ул. Абая 150');
  const [priceOffer, setPriceOffer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [tazaIndexResult, setTazaIndexResult] = useState<TazaIndexResult | null>(null);

  const pickImageForAngle = async (angle: PhotoAngle) => {
    if (!selectedCategory) {
      Alert.alert('Выберите категорию', 'Сначала выберите категорию услуги');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Нужно разрешение', 'Разрешите доступ к галерее для загрузки фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const labels: Record<PhotoAngle, string> = {
        general: 'Общий план',
        medium: 'Средний ракурс',
        detail: 'Детальный ракурс',
      };
      
      const newPhotos: CategorizedPhoto[] = result.assets.map(asset => ({
        uri: asset.uri,
        angle,
        label: labels[angle],
      }));
      
      const updatedPhotos = [...categorizedPhotos, ...newPhotos];
      setCategorizedPhotos(updatedPhotos);
      setPhotos(updatedPhotos.map(p => p.uri));
      
      if (updatedPhotos.length > 0 && selectedCategory) {
        const firstPhoto = result.assets[0];
        if (firstPhoto.base64) {
          setPhotoBase64(firstPhoto.base64);
          await analyzeImage(firstPhoto.base64, selectedCategory);
        }
      }
    }
  };

  const removePhoto = (uri: string) => {
    setCategorizedPhotos(prev => prev.filter(p => p.uri !== uri));
    setPhotos(prev => prev.filter(p => p !== uri));
  };

  const analyzeImage = async (base64: string, category: OrderCategory) => {
    setIsAnalyzing(true);
    try {
      console.log('Starting AI analysis...');
      console.log('Category:', category);
      console.log('Base64 length:', base64?.length || 0);
      
      if (!base64 || base64.length === 0) {
        console.error('No base64 data');
        Alert.alert('Ошибка', 'Не удалось получить данные изображения');
        setIsAnalyzing(false);
        return;
      }
      
      const categoryName = CATEGORIES.find(c => c.id === category)?.titleRu || 'предмет';
      console.log('Category name:', categoryName);
      
      const imageData = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
      console.log('Image data prefix:', imageData.substring(0, 50));
      
      console.log('Calling generateObject...');
      const analysis = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Проанализируй это изображение для услуги "${categoryName}". Определи: тип загрязнения/проблемы, тип материала/ткани, сложность чистки (easy/medium/hard), примерную стоимость в тенге (500-5000 для одежды, 1000-8000 для мебели/ковров, 500-3000 для обуви, 800-4000 для колясок), и 2-3 рекомендации на русском языке.`,
              },
              {
                type: 'image',
                image: imageData,
              },
            ],
          },
        ],
        schema: z.object({
          stainType: z.string().describe('Type of stain/problem in Russian'),
          fabricType: z.string().describe('Type of fabric/material in Russian'),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          estimatedPrice: z.number().describe('Estimated price in KZT'),
          recommendations: z.array(z.string()).describe('2-3 recommendations in Russian'),
          confidence: z.number().min(0).max(100).describe('Confidence level 0-100'),
        }),
      });

      console.log('AI analysis result:', analysis);
      setAiAnalysis(analysis);
      setPriceOffer(analysis.estimatedPrice.toString());
      updateTazaIndex(analysis.estimatedPrice);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      
      let errorMessage = 'Не удалось проанализировать изображение.';
      
      if (error?.message) {
        errorMessage += ` ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += ` ${error}`;
      }
      
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.cause) {
        console.error('Error cause:', error.cause);
      }
      
      Alert.alert('Ошибка AI анализа', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createOrder = async () => {
    if (!selectedCategory) {
      Alert.alert('Выберите категорию', 'Пожалуйста, выберите тип услуги');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Добавьте фото', 'Пожалуйста, загрузите фото загрязнения');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Добавьте комментарий', 'Пожалуйста, опишите задачу');
      return;
    }
    if (!priceOffer || parseFloat(priceOffer) <= 0) {
      Alert.alert('Укажите цену', 'Пожалуйста, укажите желаемую цену');
      return;
    }

    try {
      console.log('Creating order in database...');
      
      const createdOrder = await createOrderMutation.mutateAsync({
        userId: 'user-1',
        category: selectedCategory,
        photos,
        comment,
        address,
        priceOffer: parseFloat(priceOffer),
        urgency: 'standard',
        aiAnalysis: aiAnalysis || undefined,
      });

      console.log('Order created in DB:', createdOrder.id);

      const order: Order = {
        id: createdOrder.id,
        userId: createdOrder.userId,
        category: createdOrder.category as any,
        photos: createdOrder.photos,
        comment: createdOrder.comment,
        address: createdOrder.address,
        priceOffer: createdOrder.priceOffer,
        urgency: createdOrder.urgency as any,
        status: createdOrder.status as any,
        aiAnalysis: createdOrder.aiAnalysis || undefined,
        createdAt: createdOrder.createdAt,
      };

      await addOrder(order);
      
      setModalVisible(false);
      resetForm();
      
      Alert.alert(
        'Заказ создан!',
        'Химчистки скоро начнут присылать свои предложения',
        [{ text: 'Посмотреть', onPress: () => router.push(`/order/${order.id}` as any) }]
      );
    } catch (error) {
      console.error('Failed to create order:', error);
      Alert.alert('Ошибка', 'Не удалось создать заказ. Попробуйте снова.');
    }
  };

  const resetForm = () => {
    console.log('Resetting form');
    setSelectedCategory(null);
    setPhotos([]);
    setCategorizedPhotos([]);
    setPhotoBase64(null);
    setComment('');
    setPriceOffer('');
    setAiAnalysis(null);
    setIsAnalyzing(false);
  };

  const handleModalClose = () => {
    resetForm();
    setModalVisible(false);
  };

  const handleCategorySelect = async (categoryId: OrderCategory) => {
    console.log('Category selected:', categoryId);
    const oldCategory = selectedCategory;
    
    setSelectedCategory(categoryId);
    
    if (oldCategory !== categoryId) {
      console.log('Category changed, resetting form');
      setPhotos([]);
      setCategorizedPhotos([]);
      setPhotoBase64(null);
      setAiAnalysis(null);
      setPriceOffer('');
      setComment('');
    }
  };

  const adjustPrice = (delta: number) => {
    const currentPrice = parseFloat(priceOffer) || 0;
    const newPrice = Math.max(0, currentPrice + delta);
    setPriceOffer(newPrice.toString());
    updateTazaIndex(newPrice);
  };

  const updateTazaIndex = (price: number) => {
    if (!selectedCategory || price === 0) {
      setTazaIndexResult(null);
      return;
    }
    const avgPrice = AVG_PRICES[selectedCategory];
    const result = calculateTazaIndex(price, avgPrice);
    setTazaIndexResult(result);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Добро пожаловать!</Text>
            <Text style={styles.headerTitle}>TazaGo</Text>
          </View>
          <View style={styles.locationBadge}>
            <MapPin color="#00BFA6" size={16} />
            <Text style={styles.locationText}>Алматы</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createOrderButton}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.createOrderIcon}>
            <Sparkles color="#fff" size={24} />
          </View>
          <View style={styles.createOrderText}>
            <Text style={styles.createOrderTitle}>Создать заказ</Text>
            <Text style={styles.createOrderSubtitle}>AI анализ за 2 секунды</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Популярные услуги</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.color + '15' }]}
                onPress={() => {
                  if (category.id === 'cleaning') {
                    router.push('/cleaning/new');
                  } else {
                    setSelectedCategory(category.id);
                    setModalVisible(true);
                  }
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryIconText}>{category.titleRu[0]}</Text>
                </View>
                <Text style={styles.categoryTitle}>{category.titleRu}</Text>
              </TouchableOpacity>
            ))}
            <View style={{width: '100%', marginTop: 20}}>
              <TouchableOpacity
                style={styles.quickOrderButton}
                onPress={() => setModalVisible(true)}
              >
                <Sparkles color="#00BFA6" size={20} />
                <Text style={styles.quickOrderText}>Быстрый заказ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleModalClose}>
              <Text style={styles.modalCancel}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Новый заказ</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Выберите категорию *</Text>
            <Text style={styles.categorySubLabel}>
              {selectedCategory ? 'Категория выбрана. Можете загрузить фото' : 'Сначала выберите категорию'}
            </Text>
            <View style={styles.categoriesRow}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipActive,
                    { borderColor: category.color },
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && { color: category.color },
                    ]}
                  >
                    {category.titleRu}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Фото по ракурсам *</Text>
            <Text style={styles.photoHint}>Загрузите фото с разных ракурсов для точной оценки</Text>
            
            <View style={styles.anglePhotosContainer}>
              {(['general', 'medium', 'detail'] as PhotoAngle[]).map((angle) => {
                const photos = categorizedPhotos.filter(p => p.angle === angle);
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
                  <View key={angle} style={styles.anglePhotoSection}>
                    <View style={styles.anglePhotoHeader}>
                      <Text style={styles.anglePhotoIcon}>{icons[angle]}</Text>
                      <Text style={styles.anglePhotoLabel}>{labels[angle]}</Text>
                      <Text style={styles.anglePhotoCount}>({photos.length})</Text>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.anglePhotoScrollContent}>
                      {photos.map((photo) => (
                        <View key={photo.uri} style={styles.anglePhotoImageContainer}>
                          <Image source={{ uri: photo.uri }} style={styles.anglePhotoImage} contentFit="cover" />
                          <TouchableOpacity 
                            style={styles.removeAnglePhotoButton} 
                            onPress={() => removePhoto(photo.uri)}
                          >
                            <Text style={styles.removeButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      <TouchableOpacity 
                        style={styles.anglePhotoPlaceholder} 
                        onPress={() => pickImageForAngle(angle)}
                      >
                        <Camera color="#00BFA6" size={24} />
                        <Text style={styles.anglePhotoPlaceholderText}>Добавить</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                );
              })}
            </View>

            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator color="#00BFA6" />
                <Text style={styles.analyzingText}>AI анализирует изображение...</Text>
              </View>
            )}

            {aiAnalysis && (
              <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                  <Sparkles color="#FFD700" size={20} />
                  <Text style={styles.aiTitle}>AI Анализ</Text>
                </View>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Тип пятна:</Text>
                  <Text style={styles.aiValue}>{aiAnalysis.stainType}</Text>
                </View>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Материал:</Text>
                  <Text style={styles.aiValue}>{aiAnalysis.fabricType}</Text>
                </View>
                <View style={styles.aiRow}>
                  <Text style={styles.aiLabel}>Сложность:</Text>
                  <Text style={[styles.aiValue, styles.difficultyBadge]}>
                    {aiAnalysis.difficulty === 'easy' ? 'Легко' : aiAnalysis.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </Text>
                </View>
                {aiAnalysis.recommendations.length > 0 && (
                  <View style={styles.recommendations}>
                    <Text style={styles.aiLabel}>Рекомендации:</Text>
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <Text key={idx} style={styles.recommendation}>• {rec}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.label}>Описание *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Опишите, что нужно почистить..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <Text style={styles.label}>Адрес</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите адрес"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Желаемая цена *</Text>
            <View style={styles.priceContainer}>
              <TouchableOpacity 
                style={styles.priceAdjustButton}
                onPress={() => adjustPrice(-100)}
                activeOpacity={0.7}
              >
                <Text style={styles.priceAdjustText}>-100</Text>
              </TouchableOpacity>
              
              <View style={[
                styles.priceInputWrapper,
                tazaIndexResult && {
                  borderColor: tazaIndexResult.color,
                  backgroundColor: tazaIndexResult.color + '10',
                }
              ]}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Введите цену"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={priceOffer}
                  onChangeText={(text) => {
                    setPriceOffer(text);
                    const price = parseFloat(text) || 0;
                    updateTazaIndex(price);
                  }}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.priceAdjustButton}
                onPress={() => adjustPrice(100)}
                activeOpacity={0.7}
              >
                <Text style={styles.priceAdjustText}>+100</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickPriceRow}>
              <TouchableOpacity 
                style={styles.quickPriceButton}
                onPress={() => adjustPrice(-500)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPriceText}>-500</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickPriceButton}
                onPress={() => adjustPrice(500)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPriceText}>+500</Text>
              </TouchableOpacity>
            </View>

            {tazaIndexResult && selectedCategory && (
              <View style={[styles.tazaIndexCard, { borderColor: tazaIndexResult.color }]}>
                <View style={styles.tazaIndexHeader}>
                  <View style={styles.tazaIndexLeft}>
                    <TrendingUp color={tazaIndexResult.color} size={20} strokeWidth={2.5} />
                    <Text style={[styles.tazaIndexTitle, { color: tazaIndexResult.color }]}>Taza Index</Text>
                  </View>
                  <View style={[styles.tazaIndexBadge, { backgroundColor: tazaIndexResult.color + '20' }]}>
                    <Text style={styles.tazaIndexEmoji}>{tazaIndexResult.emoji}</Text>
                    <Text style={[styles.tazaIndexBadgeText, { color: tazaIndexResult.color }]}>
                      {tazaIndexResult.title}
                    </Text>
                    <Text style={[styles.tazaIndexPercent, { color: tazaIndexResult.color }]}>
                      {tazaIndexResult.index}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.tazaIndexDescription}>{tazaIndexResult.description}</Text>
                <Text style={styles.tazaIndexAvgPrice}>
                  Средняя цена: {AVG_PRICES[selectedCategory].toLocaleString('ru-KZ')} ₸
                </Text>
                {tazaIndexResult.protectionEnabled && (
                  <View style={styles.protectionBox}>
                    <Shield color="#B8860B" size={14} strokeWidth={2} fill="#FFD700" />
                    <Text style={styles.protectionText}>Premium Protection ✓</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[
                styles.findCleanerButton,
                createOrderMutation.isPending && styles.findCleanerButtonDisabled,
              ]}
              onPress={createOrder}
              activeOpacity={0.8}
              disabled={createOrderMutation.isPending}
            >
              <Text style={styles.findCleanerText}>
                {createOrderMutation.isPending ? 'Создаем...' : 'Найти исполнителя'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  createOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    marginHorizontal: 20,
    marginTop: -28,
    padding: 20,
    borderRadius: 16,
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
  createOrderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  createOrderText: {
    flex: 1,
  },
  createOrderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  createOrderSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryIconText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  cleanerCard: {
    flexDirection: 'row',
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
  cleanerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cleanerAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  cleanerInfo: {
    flex: 1,
  },
  cleanerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cleanerName: {
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
  cleanerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  cleanerOrders: {
    fontSize: 13,
    color: '#999',
  },
  cleanerResponse: {
    fontSize: 13,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 12,
    marginTop: 8,
  },
  categorySubLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    marginTop: -8,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  categoryChipActive: {
    backgroundColor: '#f8f8f8',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  photoButton: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00BFA6',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#00BFA6',
    marginTop: 12,
    fontWeight: '600' as const,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  analyzingText: {
    fontSize: 14,
    color: '#00BFA6',
    fontWeight: '500' as const,
  },
  aiCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    color: '#fff',
  },
  recommendations: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  recommendation: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  quickOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#00BFA6',
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
  quickOrderText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  priceAdjustButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  priceAdjustText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  priceInputWrapper: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00BFA6',
    justifyContent: 'center',
  },
  priceInput: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    paddingVertical: 18,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  quickPriceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickPriceButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00BFA6',
  },
  quickPriceText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  modalFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.select({ ios: 34, default: 20 }),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  findCleanerButton: {
    backgroundColor: '#00BFA6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00BFA6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  findCleanerButtonDisabled: {
    opacity: 0.7,
  },
  findCleanerText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  tazaIndexCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 2,
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
  tazaIndexLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tazaIndexTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  tazaIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tazaIndexEmoji: {
    fontSize: 14,
  },
  tazaIndexBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tazaIndexPercent: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  tazaIndexDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  tazaIndexAvgPrice: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  protectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
  },
  protectionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#B8860B',
  },
  photoHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  anglePhotosContainer: {
    gap: 16,
    marginTop: 12,
  },
  anglePhotoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  anglePhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  anglePhotoIcon: {
    fontSize: 16,
  },
  anglePhotoLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    flex: 1,
  },
  anglePhotoCount: {
    fontSize: 13,
    color: '#999',
  },
  anglePhotoScrollContent: {
    gap: 12,
    paddingRight: 12,
  },
  anglePhotoImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  anglePhotoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f8f8',
  },
  removeAnglePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700' as const,
  },
  anglePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00BFA6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    gap: 4,
  },
  anglePhotoPlaceholderText: {
    fontSize: 12,
    color: '#00BFA6',
    fontWeight: '600' as const,
  },
});
