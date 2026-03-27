import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calculator, TrendingDown, TrendingUp, Award } from 'lucide-react-native';
import {
  calculateCommission,
  URGENCY_LABELS,
  TIER_LABELS,
  TIER_REQUIREMENTS,
} from '@/constants/commission';
import { OrderUrgency, CleanerTier } from '@/types';

export default function CommissionCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [orderPrice, setOrderPrice] = useState('5000');
  const [selectedUrgency, setSelectedUrgency] = useState<OrderUrgency>('standard');
  const [selectedTier, setSelectedTier] = useState<CleanerTier>('standard');

  const commission = useMemo(() => {
    const price = parseFloat(orderPrice) || 0;
    return calculateCommission(price, selectedUrgency, selectedTier);
  }, [orderPrice, selectedUrgency, selectedTier]);

  const urgencyOptions: OrderUrgency[] = ['standard', 'fast', 'urgent', 'express'];
  const tierOptions: CleanerTier[] = ['new', 'standard', 'verified', 'premium', 'enterprise'];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Калькулятор комиссий',
          headerStyle: { backgroundColor: '#00BFA6' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={styles.header}>
          <Calculator size={48} color="#00BFA6" />
          <Text style={styles.title}>Калькулятор комиссий</Text>
          <Text style={styles.subtitle}>
            Узнайте, сколько получит химчистка и платформа
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Стоимость заказа (₸)</Text>
          <TextInput
            style={styles.input}
            value={orderPrice}
            onChangeText={setOrderPrice}
            keyboardType="numeric"
            placeholder="Введите сумму"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Срочность заказа</Text>
          <View style={styles.optionsGrid}>
            {urgencyOptions.map((urgency) => (
              <TouchableOpacity
                key={urgency}
                style={[
                  styles.optionCard,
                  selectedUrgency === urgency && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedUrgency(urgency)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedUrgency === urgency && styles.optionTextSelected,
                  ]}
                >
                  {URGENCY_LABELS[urgency].split(' ')[0]}
                </Text>
                <Text
                  style={[
                    styles.optionSubtext,
                    selectedUrgency === urgency && styles.optionSubtextSelected,
                  ]}
                >
                  {URGENCY_LABELS[urgency].split('(')[1]?.replace(')', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Уровень химчистки</Text>
          <View style={styles.tierList}>
            {tierOptions.map((tier) => {
              const req = TIER_REQUIREMENTS[tier];
              return (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.tierCard,
                    selectedTier === tier && styles.tierCardSelected,
                  ]}
                  onPress={() => setSelectedTier(tier)}
                >
                  <View style={styles.tierHeader}>
                    <Award
                      size={20}
                      color={selectedTier === tier ? '#00BFA6' : '#666'}
                    />
                    <Text
                      style={[
                        styles.tierName,
                        selectedTier === tier && styles.tierNameSelected,
                      ]}
                    >
                      {TIER_LABELS[tier]}
                    </Text>
                  </View>
                  <Text style={styles.tierRequirement}>
                    {req.minOrders}+ заказов, {req.minRating}+ рейтинг
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>Расчёт комиссии</Text>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Базовая ставка:</Text>
              <Text style={styles.breakdownValue}>
                {(commission.baseRate * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Доплата за срочность:</Text>
              <Text
                style={[
                  styles.breakdownValue,
                  commission.urgencyFee > 0 && styles.breakdownValuePositive,
                ]}
              >
                +{(commission.urgencyFee * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Скидка за уровень:</Text>
              <Text
                style={[
                  styles.breakdownValue,
                  commission.cleanerTierDiscount < 0 && styles.breakdownValueNegative,
                ]}
              >
                {(commission.cleanerTierDiscount * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelBold}>Итоговая комиссия:</Text>
              <Text style={styles.breakdownValueBold}>
                {(commission.totalCommission * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.resultCards}>
            <View style={[styles.resultCard, styles.resultCardCleaner]}>
              <TrendingUp size={24} color="#00BFA6" />
              <Text style={styles.resultCardLabel}>Получит химчистка</Text>
              <Text style={styles.resultCardValue}>
                {commission.cleanerReceives.toLocaleString()} ₸
              </Text>
              <Text style={styles.resultCardPercent}>
                {((commission.cleanerReceives / parseFloat(orderPrice || '1')) * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={[styles.resultCard, styles.resultCardPlatform]}>
              <TrendingDown size={24} color="#FF6B6B" />
              <Text style={styles.resultCardLabel}>Комиссия платформы</Text>
              <Text style={styles.resultCardValue}>
                {commission.platformReceives.toLocaleString()} ₸
              </Text>
              <Text style={styles.resultCardPercent}>
                {((commission.platformReceives / parseFloat(orderPrice || '1')) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Как работает система комиссий?</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Базовая ставка 10%</Text> для всех заказов
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>+3-8%</Text> за срочные заказы
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>До -5%</Text> скидка для крупных химчисток
          </Text>
          <Text style={styles.infoText}>
            • Минимальная комиссия всегда <Text style={styles.infoBold}>5%</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#00BFA6',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#00BFA6',
    backgroundColor: '#E8F8F5',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: '#00BFA6',
  },
  optionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  optionSubtextSelected: {
    color: '#00BFA6',
  },
  tierList: {
    gap: 8,
  },
  tierCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  tierCardSelected: {
    borderColor: '#00BFA6',
    backgroundColor: '#E8F8F5',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  tierNameSelected: {
    color: '#00BFA6',
  },
  tierRequirement: {
    fontSize: 12,
    color: '#666',
  },
  resultSection: {
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 16,
  },
  breakdownCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  breakdownValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00BFA6',
  },
  breakdownValuePositive: {
    color: '#FF6B6B',
  },
  breakdownValueNegative: {
    color: '#00BFA6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  resultCards: {
    flexDirection: 'row',
    gap: 12,
  },
  resultCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardCleaner: {
    backgroundColor: '#E8F8F5',
  },
  resultCardPlatform: {
    backgroundColor: '#FFE8E8',
  },
  resultCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resultCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
    marginTop: 8,
  },
  resultCardPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  infoBold: {
    fontWeight: '700',
    color: '#1E1E1E',
  },
});
