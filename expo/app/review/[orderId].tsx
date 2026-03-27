import { useApp } from '@/contexts/AppContext';
import { MOCK_CLEANERS } from '@/mocks/cleaners';
import { Review } from '@/types';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Star, Camera, ThumbsUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, addReview, user } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const order = orders.find(o => o.id === orderId);
  const cleaner = order?.chosenCleanerId
    ? MOCK_CLEANERS.find(c => c.id === order.chosenCleanerId)
    : null;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Нужно разрешение', 'Разрешите доступ к галерее для загрузки фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Оцените работу', 'Пожалуйста, выберите оценку');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Добавьте отзыв', 'Пожалуйста, напишите отзыв о работе');
      return;
    }

    if (!orderId || !cleaner) return;

    const review: Review = {
      id: `review-${Date.now()}`,
      orderId,
      userId: user.id,
      cleanerId: cleaner.id,
      rating,
      comment: comment.trim(),
      photos,
      createdAt: new Date().toISOString(),
    };

    await addReview(review);

    Alert.alert(
      'Спасибо за отзыв!',
      'Вы получили +20 баллов чистоты',
      [
        {
          text: 'Отлично',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (!order || !cleaner) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Отзыв' }} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen
          options={{
            title: 'Оставить отзыв',
            headerStyle: { backgroundColor: '#00BFA6' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' as const },
          }}
        />

      <View style={styles.content}>
        <View style={styles.cleanerCard}>
          <View style={styles.cleanerAvatar}>
            <Text style={styles.cleanerAvatarText}>{cleaner.name[0]}</Text>
          </View>
          <Text style={styles.cleanerName}>{cleaner.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Как прошла работа?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star
                  size={48}
                  color={star <= rating ? '#FFD700' : '#e0e0e0'}
                  fill={star <= rating ? '#FFD700' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 ? 'Отлично!' : rating === 4 ? 'Хорошо' : rating === 3 ? 'Нормально' : rating === 2 ? 'Плохо' : 'Очень плохо'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Расскажите подробнее</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Что вам понравилось или что можно улучшить?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Добавить фото (необязательно)</Text>
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoImage} contentFit="cover" />
              </View>
            ))}
            {photos.length < 3 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Camera color="#00BFA6" size={32} />
                <Text style={styles.addPhotoText}>Добавить</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.rewardBanner}>
          <ThumbsUp color="#FFD700" size={24} />
          <View style={styles.rewardText}>
            <Text style={styles.rewardTitle}>Бонус за отзыв</Text>
            <Text style={styles.rewardSubtitle}>+20 баллов чистоты</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!rating || !comment.trim()) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!rating || !comment.trim()}
        >
          <Text style={styles.submitButtonText}>Отправить отзыв</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
  },
  cleanerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cleanerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cleanerAvatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#fff',
  },
  cleanerName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#00BFA6',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E1E1E',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  charCount: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00BFA6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 13,
    color: '#00BFA6',
    marginTop: 8,
    fontWeight: '600' as const,
  },
  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#F57F17',
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: '#00BFA6',
    paddingVertical: 16,
    borderRadius: 12,
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
