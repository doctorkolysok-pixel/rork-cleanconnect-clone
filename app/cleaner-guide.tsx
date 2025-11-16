import { router } from 'expo-router';
import { Briefcase, CheckCircle, Package, Video, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

export default function CleanerGuideScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Для исполнителей</Text>
        <Text style={styles.headerSubtitle}>Инструкция по работе</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Просмотр заказов</Text>
          </View>
          <Text style={styles.stepDescription}>
            Откройте список доступных заказов. Вы увидите все новые заказы от клиентов с описанием,
            фото, AI-анализом сложности и предложенной ценой.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/cleaner/orders')}
          >
            <Package size={20} color="#00BFA6" />
            <Text style={styles.actionButtonText}>Открыть доступные заказы</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Отправка предложения</Text>
          </View>
          <Text style={styles.stepDescription}>
            Выберите интересующий заказ и отправьте свое предложение:
            {'\n'}• Укажите вашу цену
            {'\n'}• Выберите срок выполнения
            {'\n'}• Опишите свой опыт
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Клиент получит уведомление о вашем предложении и сможет выбрать вас для работы
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Активные работы</Text>
          </View>
          <Text style={styles.stepDescription}>
            После того как клиент выберет ваше предложение, заказ появится в разделе
            "Активные работы". Там вы сможете:
            {'\n'}• Общаться с клиентом
            {'\n'}• Запустить трансляцию процесса
            {'\n'}• Просматривать детали заказа
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/cleaner/my-works')}
          >
            <Briefcase size={20} color="#00BFA6" />
            <Text style={styles.actionButtonText}>Мои активные работы</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepTitle}>Трансляция процесса</Text>
          </View>
          <Text style={styles.stepDescription}>
            Запустите живую трансляцию для клиента, чтобы он мог видеть процесс работы в реальном времени.
            Это повышает доверие и улучшает рейтинг!
          </Text>
          <View style={styles.tipsBox}>
            <Video size={20} color="#FF4081" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Советы по трансляции:</Text>
              <Text style={styles.tipItem}>• Закрепите телефон на груди/поясе</Text>
              <Text style={styles.tipItem}>• Проверьте стабильность интернета</Text>
              <Text style={styles.tipItem}>• Показывайте процесс, не лица людей</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, styles.successNumber]}>
              <CheckCircle size={24} color="#fff" />
            </View>
            <Text style={styles.stepTitle}>Завершение</Text>
          </View>
          <Text style={styles.stepDescription}>
            После завершения работы клиент сможет оставить отзыв о вашей работе.
            Хорошие отзывы повышают рейтинг и увеличивают шансы получить новые заказы!
          </Text>
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ⭐ Поддерживайте рейтинг 4.5+ для получения бонусов от платформы
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Быстрые действия</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/cleaner/orders')}
            >
              <Package size={24} color="#00BFA6" />
              <Text style={styles.quickButtonText}>Заказы</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => router.push('/cleaner/my-works')}
            >
              <Briefcase size={24} color="#00BFA6" />
              <Text style={styles.quickButtonText}>Мои работы</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successNumber: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  stepDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5F3',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00BFA6',
  },
  infoBox: {
    backgroundColor: '#E8F5F3',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00BFA6',
  },
  infoText: {
    fontSize: 14,
    color: '#00796B',
    lineHeight: 20,
  },
  tipsBox: {
    backgroundColor: '#FFF0F5',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipsContent: {
    flex: 1,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#C2185B',
    marginBottom: 4,
  },
  tipItem: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 12,
    paddingLeft: 4,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
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
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
});
