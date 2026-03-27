import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { Package, Check, Star, Gift, Sparkles, ArrowRight, Calendar, Percent } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 120000,
    monthlyPrice: 10000,
    services: 24,
    description: '2 стирки в месяц',
    color: '#00BFA6',
    features: [
      'Стирка 2 комплекта одежды/мес',
      'Скидка 10% на доп. стирки',
      'Бесплатная доставка',
      'Приоритетная обработка',
      'Глажка в подарок',
    ],
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 200000,
    monthlyPrice: 16667,
    services: 48,
    description: '4 стирки в месяц',
    color: '#7C4DFF',
    popular: true,
    features: [
      'Стирка 4 комплекта одежды/мес',
      'Скидка 20% на доп. стирки',
      'Бесплатная доставка',
      'Приоритетная обработка',
      'Глажка в подарок',
      'Premium моющие средства',
      'Деликатная стирка',
    ],
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 350000,
    monthlyPrice: 29167,
    services: 96,
    description: '8 стирок в месяц',
    color: '#FFD700',
    features: [
      'Стирка 8 комплектов одежды/мес',
      'Скидка 30% на доп. стирки',
      'Бесплатная доставка',
      'VIP обработка (24ч)',
      'Глажка в подарок',
      'Premium моющие средства',
      'Деликатная стирка',
      'Химчистка (2 раза/мес)',
      'Личный менеджер',
    ],
  },
  {
    id: 'family',
    name: 'Семейный',
    price: 500000,
    monthlyPrice: 41667,
    services: 144,
    description: '12 стирок в месяц',
    color: '#FF4081',
    features: [
      'Стирка 12 комплектов одежды/мес',
      'Скидка 40% на доп. стирки',
      'Бесплатная доставка',
      'VIP обработка (12ч)',
      'Глажка в подарок',
      'Premium моющие средства',
      'Деликатная стирка',
      'Химчистка (4 раза/мес)',
      'Личный менеджер 24/7',
      'Эко-средства бесплатно',
      'Ремонт одежды',
    ],
  },
];

export default function LaundrySubscriptionScreen() {
  const { user } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');

  const handleSubscribe = () => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    Alert.alert(
      'Подтверждение подписки',
      `Вы подписываетесь на план "${plan.name}" за ${plan.price.toLocaleString('ru-KZ')} ₸/год`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Оформить',
          onPress: () => {
            Alert.alert(
              'Успешно!',
              `Абонемент "${plan.name}" оформлен! Ваши ${plan.services} стирок будут доступны в течение года.`,
              [{ text: 'ОК', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

  return (
    <View style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#00BFA6', '#00A896']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Package color="#FFD700" size={48} strokeWidth={2} />
            <Text style={styles.headerTitle}>Годовой абонемент</Text>
            <Text style={styles.headerSubtitle}>
              Стирка, глажка и химчистка одежды круглый год
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.benefitsSection}>
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#E8F5F3' }]}>
              <Percent color="#00BFA6" size={24} />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Выгода до 40%</Text>
              <Text style={styles.benefitDesc}>Чем больше план, тем больше экономия</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#FFF8E1' }]}>
              <Gift color="#FFD700" size={24} />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Глажка бесплатно</Text>
              <Text style={styles.benefitDesc}>Профессиональная глажка включена</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: '#FFE8F5' }]}>
              <Star color="#FF4081" size={24} />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Химчистка со скидкой</Text>
              <Text style={styles.benefitDesc}>Специальные тарифы для абонентов</Text>
            </View>
          </View>
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Выберите план</Text>
          
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Sparkles color="#FFD700" size={14} />
                  <Text style={styles.popularText}>Популярный</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planLeft}>
                  <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                    <Package color={plan.color} size={28} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                </View>
                
                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>
                    {plan.price.toLocaleString('ru-KZ')} ₸
                  </Text>
                  <Text style={styles.planPriceMonthly}>
                    {plan.monthlyPrice.toLocaleString('ru-KZ')} ₸/мес
                  </Text>
                </View>
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check color={plan.color} size={16} strokeWidth={3} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.planStats}>
                <View style={styles.planStat}>
                  <Calendar color="#999" size={16} />
                  <Text style={styles.planStatText}>12 месяцев</Text>
                </View>
                <View style={styles.planStat}>
                  <Package color="#999" size={16} />
                  <Text style={styles.planStatText}>{plan.services} стирок</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Как это работает?</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Выберите план</Text>
              <Text style={styles.stepDesc}>
                Подберите подходящий годовой абонемент
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Оплатите один раз</Text>
              <Text style={styles.stepDesc}>
                Один платеж на весь год со скидкой
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Пользуйтесь услугами</Text>
              <Text style={styles.stepDesc}>
                Создавайте заказы в рамках абонемента
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.infoTitle}>Часто задаваемые вопросы</Text>
          
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Можно ли переносить стирки?</Text>
            <Text style={styles.faqAnswer}>
              Да! Неиспользованные стирки переносятся на следующий месяц в рамках года.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Что если нужно больше стирок?</Text>
            <Text style={styles.faqAnswer}>
              Вы можете заказать дополнительные стирки со скидкой по вашему плану.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Можно ли поделиться с семьей?</Text>
            <Text style={styles.faqAnswer}>
              Да, абонемент можно использовать для всех членов семьи.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {selectedPlanData && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerPlanName}>{selectedPlanData.name}</Text>
            <Text style={styles.footerPrice}>
              {selectedPlanData.price.toLocaleString('ru-KZ')} ₸/год
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: selectedPlanData.color }]}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeText}>Оформить</Text>
            <ArrowRight color="#fff" size={20} strokeWidth={2.5} />
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
    paddingTop: Platform.select({ ios: 60, default: 40 }),
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600' as const,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  benefitsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#666',
  },
  plansSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  planCardSelected: {
    borderColor: '#00BFA6',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  planPriceMonthly: {
    fontSize: 13,
    color: '#00BFA6',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  planFeatures: {
    gap: 10,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#1E1E1E',
    flex: 1,
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planStatText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500' as const,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
  },
  faqSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  faqCard: {
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
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.select({ ios: 34, default: 20 }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  footerInfo: {
    flex: 1,
  },
  footerPlanName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#00BFA6',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
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
  subscribeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
