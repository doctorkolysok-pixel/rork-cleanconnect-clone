import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { SUBCATEGORY_MARKET_PRICES, evaluateTazaFair, getTazaFairBand } from '@/constants/tazaFair';
import { SUBCATEGORIES, SubcategoryId, SubcategoryInfo } from '@/constants/subcategories';
import type { LucideIcon } from 'lucide-react-native';
import {
  Award,
  BarChart3,
  Calculator,
  CheckCircle2,
  FileText,
  Globe2,
  LineChart,
  PiggyBank,
  Rocket,
  Shield,
  ShieldCheck,
  Smartphone,
  Target,
  Wand2,
} from 'lucide-react-native';

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const formatDigits = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const parseToNumber = (value: string) => {
  const digits = sanitizeDigits(value);
  if (digits.length === 0) {
    return 0;
  }
  return parseInt(digits, 10);
};

const getSubcategoryLookup = () => {
  const map: Record<SubcategoryId, SubcategoryInfo> = {};
  Object.values(SUBCATEGORIES).forEach((items) => {
    items.forEach((item) => {
      map[item.id as SubcategoryId] = item;
    });
  });
  return map;
};

const SUB_LOOKUP = getSubcategoryLookup();

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return value.toLocaleString('ru-RU');
};

const formatInputFromNumber = (value: number | undefined) => {
  if (!value || value <= 0) {
    return '';
  }
  return formatDigits(String(value));
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export default function BusinessToolsScreen() {
  const { user, orders, saveUser } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [revenueGoalInput, setRevenueGoalInput] = useState<string>(() => formatInputFromNumber(user.monthlyRevenueGoal) || '600 000');
  const [expenseBudgetInput, setExpenseBudgetInput] = useState<string>(() => formatInputFromNumber(user.monthlyExpenseBudget) || '240 000');

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const monthlyOrders = useMemo(() => {
    return orders.filter((order) => {
      if (order.status !== 'completed') {
        return false;
      }
      const completedAt = order.completedAt ? new Date(order.completedAt) : new Date(order.createdAt);
      return completedAt.getFullYear() === currentMonth.year && completedAt.getMonth() === currentMonth.month;
    });
  }, [orders, currentMonth]);

  const monthlyRevenue = useMemo(() => monthlyOrders.reduce((sum, order) => sum + (order.priceOffer ?? 0), 0), [monthlyOrders]);

  const averageTicket = useMemo(() => {
    if (monthlyOrders.length === 0) {
      return 0;
    }
    return Math.round(monthlyRevenue / monthlyOrders.length);
  }, [monthlyOrders, monthlyRevenue]);

  const serviceEvaluations = useMemo(() => {
    if (!user.servicePrices) {
      return [] as { subcategory: SubcategoryInfo; price: number; bandColor: string; bandLabel: string; bandBg: string; deltaPercent: number; recommended: number; }[];
    }
    const entries = Object.entries(user.servicePrices) as [string, number][];
    return entries.reduce((acc, [subIdKey, priceValue]) => {
      const subId = subIdKey as SubcategoryId;
      const info = SUB_LOOKUP[subId];
      if (!info) {
        return acc;
      }
      const marketEntry = SUBCATEGORY_MARKET_PRICES[subId];
      const avg = marketEntry?.avgPrice ?? priceValue;
      const evaluation = evaluateTazaFair(priceValue, avg);
      acc.push({
        subcategory: info,
        price: priceValue,
        bandColor: evaluation.band.color,
        bandLabel: evaluation.band.label,
        bandBg: evaluation.band.background,
        deltaPercent: evaluation.deltaPercent,
        recommended: evaluation.recommendedPrice,
      });
      return acc;
    }, [] as { subcategory: SubcategoryInfo; price: number; bandColor: string; bandLabel: string; bandBg: string; deltaPercent: number; recommended: number; }[]);
  }, [user.servicePrices]);

  const tazaFairSummary = useMemo(() => {
    if (serviceEvaluations.length === 0) {
      return null;
    }
    const totalIndex = serviceEvaluations.reduce((acc, item) => {
      const marketEntry = SUBCATEGORY_MARKET_PRICES[item.subcategory.id as SubcategoryId];
      const avg = marketEntry?.avgPrice ?? item.price;
      const evaluation = evaluateTazaFair(item.price, avg);
      return acc + evaluation.index;
    }, 0);
    const avgIndex = Math.round(totalIndex / serviceEvaluations.length);
    const band = getTazaFairBand(avgIndex);
    const weakest = [...serviceEvaluations]
      .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
      .slice(0, 2);
    return {
      avgIndex,
      band,
      weakest,
    };
  }, [serviceEvaluations]);

  const revenueGoal = useMemo(() => {
    const parsed = parseToNumber(revenueGoalInput);
    return parsed > 0 ? parsed : user.monthlyRevenueGoal ?? 0;
  }, [revenueGoalInput, user.monthlyRevenueGoal]);

  const expenseBudget = useMemo(() => {
    const parsed = parseToNumber(expenseBudgetInput);
    return parsed > 0 ? parsed : user.monthlyExpenseBudget ?? 0;
  }, [expenseBudgetInput, user.monthlyExpenseBudget]);

  const profitForecast = useMemo(() => {
    const goal = revenueGoal > 0 ? revenueGoal : monthlyRevenue;
    return goal - expenseBudget;
  }, [revenueGoal, expenseBudget, monthlyRevenue]);

  const goalProgress = useMemo(() => {
    if (revenueGoal <= 0) {
      return 0;
    }
    const ratio = monthlyRevenue / revenueGoal;
    if (!Number.isFinite(ratio) || ratio < 0) {
      return 0;
    }
    if (ratio > 1) {
      return 1;
    }
    return ratio;
  }, [monthlyRevenue, revenueGoal]);

  const commitGoalValue = useCallback(async () => {
    const parsedGoal = parseToNumber(revenueGoalInput);
    const parsedBudget = parseToNumber(expenseBudgetInput);
    console.log('[BusinessToolsScreen] commitGoalValue', { parsedGoal, parsedBudget });
    const updatedUser = {
      ...user,
      monthlyRevenueGoal: parsedGoal,
      monthlyExpenseBudget: parsedBudget,
    };
    await saveUser(updatedUser);
  }, [expenseBudgetInput, revenueGoalInput, saveUser, user]);

  const recommendedServices = useMemo(() => {
    return serviceEvaluations
      .filter((item) => item.deltaPercent < -10 || item.deltaPercent > 15)
      .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
      .slice(0, 3);
  }, [serviceEvaluations]);

  const appStoreChecklist = useMemo<ChecklistItem[]>(() => {
    return [
      {
        id: 'testing',
        title: 'Проверь, что всё работает',
        description: 'Пройди через основные сценарии: регистрация, заказ, платежи. На айфоне и на веб.',
        icon: CheckCircle2,
        accent: '#22C55E',
      },
      {
        id: 'content',
        title: 'Собери контент и описания',
        description: 'Скриншоты, иконка 1024×1024, превью и короткое описание на русском и английском.',
        icon: FileText,
        accent: '#0EA5E9',
      },
      {
        id: 'policies',
        title: 'Политики и поддержка',
        description: 'Добавь Privacy Policy, Terms и email поддержки прямо в профиле исполнителя.',
        icon: Shield,
        accent: '#6366F1',
      },
      {
        id: 'accounts',
        title: 'Аккаунт разработчика',
        description: 'Оформи Apple Developer Program и привяжи оплату, чтобы загрузить билд.',
        icon: Globe2,
        accent: '#F97316',
      },
      {
        id: 'devices',
        title: 'Проверь на реальных устройствах',
        description: 'Запусти приложение через TestFlight на iPhone и iPad, собери обратную связь.',
        icon: Smartphone,
        accent: '#FACC15',
      },
    ];
  }, []);

  return (
    <View style={styles.container} testID="business-tools-screen">
      <Stack.Screen
        options={{
          title: 'Бизнес утилиты',
          headerStyle: { backgroundColor: '#0B1624' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0B1624', '#112C4A']}
          style={[styles.hero, { paddingTop: 28 + insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroSubtitle}>TazaGo Business Desk</Text>
              <Text style={styles.heroTitle}>Управляй заработком</Text>
            </View>
            <View style={styles.heroBadge}>
              <Rocket color="#0B1624" size={18} />
              <Text style={styles.heroBadgeText}>Рост активирован</Text>
            </View>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard} testID="stat-revenue">
              <Text style={styles.heroStatLabel}>Доход месяц</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(monthlyRevenue)} ₸</Text>
            </View>
            <View style={styles.heroStatCard} testID="stat-orders">
              <Text style={styles.heroStatLabel}>Заказов</Text>
              <Text style={styles.heroStatValue}>{monthlyOrders.length}</Text>
            </View>
            <View style={styles.heroStatCard} testID="stat-ticket">
              <Text style={styles.heroStatLabel}>Средний чек</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(averageTicket)} ₸</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.card} testID="goal-card">
          <View style={styles.cardHeader}>
            <Target color="#0B1624" size={22} />
            <Text style={styles.cardTitle}>Финансовые цели</Text>
          </View>
          <View style={styles.goalRow}>
            <View style={styles.goalInputBlock}>
              <Text style={styles.inputLabel}>Цель по выручке</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={revenueGoalInput}
                  onChangeText={(text) => {
                    const digits = sanitizeDigits(text);
                    const formatted = formatDigits(digits);
                    console.log('[BusinessToolsScreen] revenueGoalInputChanged', { digits, formatted });
                    setRevenueGoalInput(formatted);
                  }}
                  onBlur={commitGoalValue}
                  keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                  inputMode="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.currency}>₸</Text>
              </View>
            </View>
            <View style={styles.goalInputBlock}>
              <Text style={styles.inputLabel}>Бюджет расходов</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={expenseBudgetInput}
                  onChangeText={(text) => {
                    const digits = sanitizeDigits(text);
                    const formatted = formatDigits(digits);
                    console.log('[BusinessToolsScreen] expenseBudgetInputChanged', { digits, formatted });
                    setExpenseBudgetInput(formatted);
                  }}
                  onBlur={commitGoalValue}
                  keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                  inputMode="numeric"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.currency}>₸</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${goalProgress * 100}%` }]} />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.progressValue}>{Math.round(goalProgress * 100)}%</Text>
              <Text style={styles.progressCaption}>Выполнено от цели {formatCurrency(revenueGoal)} ₸</Text>
            </View>
          </View>
          <View style={styles.profitRow}>
            <View style={styles.profitCard}>
              <PiggyBank color="#0B1624" size={20} />
              <Text style={styles.profitLabel}>Прогноз чистыми</Text>
              <Text style={[styles.profitValue, { color: profitForecast >= 0 ? '#0B9854' : '#FF5A64' }]}>
                {formatCurrency(profitForecast)} ₸
              </Text>
            </View>
            <View style={styles.profitCard}>
              <LineChart color="#0B1624" size={20} />
              <Text style={styles.profitLabel}>Разрыв до цели</Text>
              <Text style={styles.profitValue}>{formatCurrency(Math.max(revenueGoal - monthlyRevenue, 0))} ₸</Text>
            </View>
          </View>
        </View>

        {tazaFairSummary && (
          <View style={styles.tazaCard} testID="tazafair-card">
            <View style={[styles.tazaBadge, { backgroundColor: tazaFairSummary.band.background }]}> 
              <ShieldCheck color={tazaFairSummary.band.color} size={18} />
              <Text style={[styles.tazaBadgeText, { color: tazaFairSummary.band.color }]}>TazaFair {tazaFairSummary.avgIndex}%</Text>
            </View>
            <Text style={styles.tazaTitle}>{tazaFairSummary.band.label}</Text>
            <Text style={styles.tazaSubtitle}>{tazaFairSummary.band.subtitle}</Text>
            <View style={styles.tazaWeakList}>
              {tazaFairSummary.weakest.map((item) => (
                <View key={item.subcategory.id} style={styles.tazaWeakItem}>
                  <View style={[styles.tazaWeakBadge, { backgroundColor: item.bandBg }]}> 
                    <Text style={[styles.tazaWeakBadgeText, { color: item.bandColor }]}>{item.bandLabel}</Text>
                  </View>
                  <View style={styles.tazaWeakContent}>
                    <Text style={styles.tazaWeakTitle}>{item.subcategory.title}</Text>
                    <Text style={styles.tazaWeakCaption}>
                      {item.deltaPercent >= 0 ? `+${item.deltaPercent}% к рынку` : `${item.deltaPercent}% от рынка`} • Совет: {formatCurrency(item.recommended)} ₸
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.tazaButton}
              onPress={() => {
                console.log('[BusinessToolsScreen] navigateToEditProfile');
                router.push('/cleaner/edit-profile' as never);
              }}
              activeOpacity={0.85}
              testID="tazafair-edit-button"
            >
              <Wand2 color="#fff" size={18} />
              <Text style={styles.tazaButtonText}>Перенастроить цены</Text>
            </TouchableOpacity>
          </View>
        )}

        {recommendedServices.length > 0 && (
          <View style={styles.card} testID="recommended-card">
            <View style={styles.cardHeader}>
              <BarChart3 color="#0B1624" size={22} />
              <Text style={styles.cardTitle}>Фокус на рост</Text>
            </View>
            {recommendedServices.map((item) => (
              <View key={item.subcategory.id} style={styles.recoRow}>
                <View style={styles.recoIcon}>
                  <Text style={styles.recoEmoji}>{item.subcategory.icon}</Text>
                </View>
                <View style={styles.recoBody}>
                  <Text style={styles.recoTitle}>{item.subcategory.title}</Text>
                  <Text style={styles.recoCaption}>
                    {item.deltaPercent >= 0 ? `На ${item.deltaPercent}% выше рынка` : `На ${Math.abs(item.deltaPercent)}% ниже рынка`} — рекомендованная цена {formatCurrency(item.recommended)} ₸
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.toolboxCard} testID="toolbox-card">
          <View style={styles.cardHeader}>
            <Calculator color="#fff" size={22} />
            <Text style={styles.toolboxTitle}>Набор инструментов</Text>
          </View>
          <View style={styles.toolboxGrid}>
            <TouchableOpacity
              style={styles.toolboxItem}
              onPress={() => {
                console.log('[BusinessToolsScreen] openCommissionCalculator');
                router.push('/commission-calculator' as never);
              }}
              activeOpacity={0.85}
              testID="tool-commission"
            >
              <Award color="#0B1624" size={20} />
              <Text style={styles.toolboxItemTitle}>Комиссии</Text>
              <Text style={styles.toolboxItemCaption}>Проверь сколько получит сервис</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolboxItem}
              onPress={() => {
                console.log('[BusinessToolsScreen] openOrders');
                router.push('/(tabs)/orders' as never);
              }}
              activeOpacity={0.85}
              testID="tool-orders"
            >
              <LineChart color="#0B1624" size={20} />
              <Text style={styles.toolboxItemTitle}>Поток заказов</Text>
              <Text style={styles.toolboxItemCaption}>Следите за прогрессом сделок</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolboxItem}
              onPress={() => {
                console.log('[BusinessToolsScreen] openProfileSetup');
                router.push('/cleaner/profile-setup' as never);
              }}
              activeOpacity={0.85}
              testID="tool-profile"
            >
              <Target color="#0B1624" size={20} />
              <Text style={styles.toolboxItemTitle}>Настроить профиль</Text>
              <Text style={styles.toolboxItemCaption}>Усилите доверие и конверсию</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.publishCard} testID="appstore-checklist">
          <View style={styles.publishHeader}>
            <View>
              <Text style={styles.publishTitle}>Готовность к App Store</Text>
              <Text style={styles.publishSubtitle}>Чек-лист, чтобы тебя не завернули на модерации</Text>
            </View>
            <View style={styles.publishBadge}>
              <Rocket color="#0F1B2B" size={18} />
              <Text style={styles.publishBadgeText}>Launch Ready</Text>
            </View>
          </View>

          <View style={styles.publishList}>
            {appStoreChecklist.map((item) => {
              const IconComponent = item.icon;
              return (
                <View key={item.id} style={styles.publishItem}>
                  <View style={[styles.publishIconWrapper, { backgroundColor: `${item.accent}22` }]}
                    testID={`checklist-icon-${item.id}`}>
                    <IconComponent color={item.accent} size={20} />
                  </View>
                  <View style={styles.publishContent}>
                    <Text style={styles.publishItemTitle}>{item.title}</Text>
                    <Text style={styles.publishItemDescription}>{item.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.publishAction}
            activeOpacity={0.85}
            onPress={() => {
              console.log('[BusinessToolsScreen] openAppStoreGuide');
              router.push('/cleaner-guide' as never);
            }}
            testID="checklist-action"
          >
            <CheckCircle2 color="#0F1B2B" size={18} />
            <Text style={styles.publishActionText}>Скачать шпаргалку публикации</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1B2B',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSubtitle: {
    color: '#7DD3FC',
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4F1F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    color: '#0B1624',
    fontSize: 13,
    fontWeight: '600',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 51, 0.65)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
  },
  heroStatLabel: {
    color: '#C4F1F9',
    fontSize: 12,
    marginBottom: 10,
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0B1624',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1624',
  },
  goalRow: {
    flexDirection: 'row',
    gap: 16,
  },
  goalInputBlock: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    textAlign: 'right',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1624',
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 20,
    gap: 10,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 999,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1624',
  },
  progressCaption: {
    fontSize: 12,
    color: '#64748B',
  },
  profitRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  profitCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profitLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1624',
  },
  tazaCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 22,
    padding: 22,
    backgroundColor: '#101C30',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
    gap: 14,
  },
  tazaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  tazaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tazaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  tazaSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  tazaWeakList: {
    gap: 12,
  },
  tazaWeakItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tazaWeakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tazaWeakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tazaWeakContent: {
    flex: 1,
    gap: 4,
  },
  tazaWeakTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  tazaWeakCaption: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tazaButton: {
    marginTop: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tazaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  recoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  recoIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoEmoji: {
    fontSize: 26,
  },
  recoBody: {
    flex: 1,
    gap: 6,
  },
  recoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1624',
  },
  recoCaption: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  toolboxCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 22,
    padding: 22,
    backgroundColor: '#102033',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.2)',
    gap: 18,
  },
  toolboxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  toolboxGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  toolboxItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  toolboxItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1624',
  },
  toolboxItemCaption: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  publishCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    borderRadius: 24,
    padding: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 27, 43, 0.08)',
    shadowColor: '#0B1624',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    gap: 20,
  },
  publishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  publishTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  publishSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
  },
  publishBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4F1F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  publishBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1B2B',
  },
  publishList: {
    gap: 16,
  },
  publishItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  publishIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishContent: {
    flex: 1,
    gap: 6,
  },
  publishItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  publishItemDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  publishAction: {
    marginTop: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  publishActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1B2B',
  },
});
