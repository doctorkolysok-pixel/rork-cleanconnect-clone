import React, { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/constants/categories';
import {
  SUBCATEGORIES,
  DEFAULT_SUBCATEGORY_PRICES,
  SubcategoryId,
  SubcategoryInfo,
} from '@/constants/subcategories';
import { SUBCATEGORY_MARKET_PRICES, evaluateTazaFair, TazaFairEvaluation, getTazaFairBand } from '@/constants/tazaFair';
import { OrderCategory } from '@/types';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  Wand2,
  Stars,
  Crown,
} from 'lucide-react-native';

interface SelectedEvaluation {
  subcategory: SubcategoryInfo;
  subcategoryId: SubcategoryId;
  price: number;
  evaluation: TazaFairEvaluation;
  marketAvg: number;
  recommended: number;
  trend: 'up' | 'down' | 'stable';
  note: string;
}

type PriceInputMap = Partial<Record<SubcategoryId, string>>;

const SUBCATEGORY_MAP: Record<SubcategoryId, SubcategoryInfo> = Object.values(SUBCATEGORIES)
  .flat()
  .reduce((acc, item) => {
    acc[item.id as SubcategoryId] = item;
    return acc;
  }, {} as Record<SubcategoryId, SubcategoryInfo>);

const CATEGORY_TOKENS: Record<OrderCategory, { accent: string; tint: string }> = {
  clothing: { accent: '#00BFA6', tint: '#E6FBF6' },
  furniture: { accent: '#FF6B6B', tint: '#FFECEC' },
  shoes: { accent: '#4ECDC4', tint: '#E6FAF7' },
  carpets: { accent: '#FFD700', tint: '#FFF6CC' },
  cleaning: { accent: '#4CAF50', tint: '#E9F9EE' },
  strollers: { accent: '#9C27B0', tint: '#F6E8FF' },
};

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const normalizeDigitString = (digits: string) => {
  if (digits.length === 0) {
    return '';
  }
  const trimmed = digits.replace(/^0+(?=\d)/, '');
  if (trimmed.length === 0) {
    return '0';
  }
  return trimmed;
};

const formatDigitsWithSpaces = (digits: string) => {
  if (!digits) {
    return '';
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatPriceInputFromNumber = (value: number) => {
  if (!value) {
    return '';
  }
  return formatDigitsWithSpaces(sanitizeDigits(formatNumber(value)));
};

const parsePriceInputToNumber = (value: string | undefined) => {
  const digits = sanitizeDigits(value ?? '');
  if (digits.length === 0) {
    return 0;
  }
  return parseInt(digits, 10);
};

export default function CleanerEditProfile() {
  const { user, saveUser } = useApp();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const numericKeyboardType = Platform.OS === 'ios' ? 'number-pad' : 'numeric';

  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [address, setAddress] = useState(user.address || '');
  const [description, setDescription] = useState(user.description || '');
  const [workingHours, setWorkingHours] = useState(user.workingHours || '9:00 - 20:00');
  const [staffCount, setStaffCount] = useState(user.staffCount?.toString() || '1');

  const [selectedCategories, setSelectedCategories] = useState<Set<OrderCategory>>(() => {
    const cats = new Set<OrderCategory>();
    if (user.servicePrices) {
      Object.keys(user.servicePrices).forEach((key) => {
        const subcategory = SUBCATEGORY_MAP[key as SubcategoryId];
        if (subcategory) {
          cats.add(subcategory.parentCategory);
        }
      });
    }
    return cats;
  });

  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<SubcategoryId>>(() => {
    const subs = new Set<SubcategoryId>();
    if (user.servicePrices) {
      Object.keys(user.servicePrices).forEach((key) => {
        const subcategory = SUBCATEGORY_MAP[key as SubcategoryId];
        if (subcategory) {
          subs.add(subcategory.id);
        }
      });
    }
    return subs;
  });

  const [subcategoryPriceInputs, setSubcategoryPriceInputs] = useState<PriceInputMap>(() => {
    const prices: PriceInputMap = {};
    if (user.servicePrices) {
      Object.entries(user.servicePrices).forEach(([key, value]) => {
        if (SUBCATEGORY_MAP[key as SubcategoryId]) {
          prices[key as SubcategoryId] = formatPriceInputFromNumber(value);
        }
      });
    }
    return prices;
  });

  const toggleCategory = (category: OrderCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        console.log('[CleanerEditProfile] Category removed', { category });
        next.delete(category);
        const subcatsToRemove = SUBCATEGORIES[category].map((item) => item.id);
        setSelectedSubcategories((prevSubs) => {
          const updated = new Set(prevSubs);
          subcatsToRemove.forEach((id) => updated.delete(id as SubcategoryId));
          return updated;
        });
      } else {
        console.log('[CleanerEditProfile] Category added', { category });
        next.add(category);
      }
      return next;
    });
  };

  const toggleSubcategory = (subcategoryId: SubcategoryId) => {
    setSelectedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(subcategoryId)) {
        console.log('[CleanerEditProfile] Subcategory removed', { subcategoryId });
        next.delete(subcategoryId);
      } else {
        console.log('[CleanerEditProfile] Subcategory added', { subcategoryId });
        next.add(subcategoryId);
        if (!subcategoryPriceInputs[subcategoryId]) {
          const fallback = SUBCATEGORY_MARKET_PRICES[subcategoryId]?.recommendedFair
            ?? Number(DEFAULT_SUBCATEGORY_PRICES[subcategoryId]);
          setSubcategoryPriceInputs((prevPrices) => ({
            ...prevPrices,
            [subcategoryId]: formatPriceInputFromNumber(fallback),
          }));
        }
      }
      return next;
    });
  };

  const updateSubcategoryPrice = (subcategoryId: SubcategoryId, priceInput: string) => {
    const digits = sanitizeDigits(priceInput);
    const normalizedDigits = normalizeDigitString(digits);
    const formatted = formatDigitsWithSpaces(normalizedDigits);
    const numericValue = parsePriceInputToNumber(formatted);
    console.log('[CleanerEditProfile] Price changed', { subcategoryId, formatted, numericValue });
    setSubcategoryPriceInputs((prev) => ({
      ...prev,
      [subcategoryId]: formatted,
    }));
  };

  const applyRecommendedPrice = (subcategoryId: SubcategoryId, recommended: number) => {
    const formatted = formatPriceInputFromNumber(recommended);
    console.log('[CleanerEditProfile] Recommended price applied', { subcategoryId, recommended, formatted });
    setSubcategoryPriceInputs((prev) => ({
      ...prev,
      [subcategoryId]: formatted,
    }));
  };

  const evaluatedSubcategories = useMemo<SelectedEvaluation[]>(() => {
    const list = Array.from(selectedSubcategories);
    list.sort((a, b) => SUBCATEGORY_MAP[a].title.localeCompare(SUBCATEGORY_MAP[b].title));
    return list.map((subId) => {
      const info = SUBCATEGORY_MAP[subId];
      const marketEntry = SUBCATEGORY_MARKET_PRICES[subId];
      const avg = marketEntry?.avgPrice ?? Number(DEFAULT_SUBCATEGORY_PRICES[subId]);
      const inputValue = subcategoryPriceInputs[subId];
      const hasManualValue = typeof inputValue === 'string' && inputValue.trim().length > 0;
      const numericValue = parsePriceInputToNumber(inputValue);
      const recommended = marketEntry?.recommendedFair ?? avg;
      const price = hasManualValue ? numericValue : recommended;
      const evaluation = evaluateTazaFair(price, avg);
      return {
        subcategory: info,
        subcategoryId: subId,
        price,
        evaluation,
        marketAvg: avg,
        recommended,
        trend: marketEntry?.trend ?? 'stable',
        note: marketEntry?.note ?? 'Актуальные данные городского рынка',
      };
    });
  }, [selectedSubcategories, subcategoryPriceInputs]);

  const tazaFairSummary = useMemo(() => {
    if (evaluatedSubcategories.length === 0) {
      return null;
    }
    const totalIndex = evaluatedSubcategories.reduce((acc, item) => acc + item.evaluation.index, 0);
    const avgIndex = Math.round(totalIndex / evaluatedSubcategories.length);
    const avgBand = getTazaFairBand(avgIndex);
    const worst = evaluatedSubcategories.reduce((acc, item) => {
      if (!acc) {
        return item;
      }
      if (item.evaluation.band.severityRank > acc.evaluation.band.severityRank) {
        return item;
      }
      if (item.evaluation.band.severityRank === acc.evaluation.band.severityRank) {
        return Math.abs(item.evaluation.deltaPercent) > Math.abs(acc.evaluation.deltaPercent) ? item : acc;
      }
      return acc;
    }, evaluatedSubcategories[0]);
    const belowMarketCount = evaluatedSubcategories.filter((item) => item.evaluation.band.id === 'too_low' || item.evaluation.band.id === 'moderately_low').length;
    const premiumCount = evaluatedSubcategories.filter((item) => item.evaluation.band.id === 'premium' || item.evaluation.band.id === 'vip').length;
    return {
      avgIndex,
      avgBand,
      worst,
      belowMarketCount,
      premiumCount,
      total: evaluatedSubcategories.length,
    };
  }, [evaluatedSubcategories]);

  const handleSave = async () => {
    if (!companyName || !address) {
      alert('Заполните название компании и адрес');
      return;
    }

    if (selectedSubcategories.size === 0) {
      alert('Выберите хотя бы одну услугу');
      return;
    }

    setIsLoading(true);
    console.log('[CleanerEditProfile] Save triggered', { selectedSubcategories: Array.from(selectedSubcategories).length });

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pricesMap: Record<string, number> = {};
      selectedSubcategories.forEach((subId) => {
        const recommended = SUBCATEGORY_MARKET_PRICES[subId]?.recommendedFair ?? Number(DEFAULT_SUBCATEGORY_PRICES[subId]);
        const inputValue = subcategoryPriceInputs[subId];
        const numericValue = parsePriceInputToNumber(inputValue);
        const price = numericValue > 0 ? numericValue : recommended;
        pricesMap[subId] = price;
      });

      const updatedUser = {
        ...user,
        companyName,
        address,
        description,
        workingHours,
        servicePrices: pricesMap,
        staffCount: parseInt(staffCount, 10) || 1,
        isProfileComplete: true,
      };

      await saveUser(updatedUser);

      alert('Профиль успешно обновлен');
      router.back();
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Ошибка обновления профиля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Редактировать профиль',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1E1E1E',
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Основная информация</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Building2 color="#00BFA6" size={18} />
              </View>
              <TextInput
                testID="input-company-name"
                style={styles.input}
                placeholder="Название компании"
                value={companyName}
                onChangeText={setCompanyName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin color="#00BFA6" size={18} />
              </View>
              <TextInput
                testID="input-address"
                style={styles.input}
                placeholder="Адрес"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Clock color="#00BFA6" size={18} />
              </View>
              <TextInput
                testID="input-working-hours"
                style={styles.input}
                placeholder="Время работы"
                value={workingHours}
                onChangeText={setWorkingHours}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Users color="#00BFA6" size={18} />
              </View>
              <TextInput
                testID="input-staff-count"
                style={styles.input}
                placeholder="Количество сотрудников"
                value={staffCount}
                onChangeText={setStaffCount}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <TextInput
              testID="input-description"
              style={styles.textArea}
              placeholder="Описание услуг (необязательно)"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Шаг 1: Сферы работы</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.has(category.id);
                const selectedServices = Array.from(selectedSubcategories).filter(
                  (id) => SUBCATEGORY_MAP[id].parentCategory === category.id,
                );
                const tokens = CATEGORY_TOKENS[category.id];
                return (
                  <TouchableOpacity
                    key={category.id}
                    testID={`category-card-${category.id}`}
                    style={[styles.categoryCard, { borderColor: isSelected ? tokens.accent : '#E2E8F0' }, isSelected && { backgroundColor: '#FFFFFF' }]}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.categoryLogoBubble, { backgroundColor: isSelected ? tokens.tint : '#F1F4FB' }]}
                      testID={`category-logo-${category.id}`}
                    >
                      <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    </View>
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryTitle}>{category.titleRu}</Text>
                      <Text style={[styles.categorySubtitle, isSelected && styles.categorySubtitleActive]}>
                        {isSelected
                          ? selectedServices.length > 0
                            ? `${selectedServices.length} услуг`
                            : 'Выбрано направление'
                          : 'Нажмите, чтобы выбрать'}
                      </Text>
                    </View>
                    <View style={[styles.categoryToggle, { borderColor: isSelected ? tokens.accent : '#CBD5E1' }, isSelected && { backgroundColor: tokens.accent }]}
                      testID={`category-toggle-${category.id}`}
                    >
                      <View style={[styles.categoryToggleDot, isSelected && { backgroundColor: '#FFFFFF' }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {Array.from(selectedCategories).map((categoryId) => {
              const subs = SUBCATEGORIES[categoryId];
              return (
                <View key={categoryId} style={styles.subcategorySection}>
                  <View style={styles.subcategoryHeader}>
                    <Text style={styles.subcategoryHeaderTitle}>Услуги: {CATEGORIES.find((item) => item.id === categoryId)?.titleRu}</Text>
                    <Text style={styles.subcategoryHeaderHint}>Выберите то, что реально выполняете</Text>
                  </View>
                  <View style={styles.subcategoryChips}>
                    {subs.map((subcategory) => {
                      const isSelected = selectedSubcategories.has(subcategory.id as SubcategoryId);
                      return (
                        <TouchableOpacity
                          key={subcategory.id}
                          testID={`subcategory-chip-${subcategory.id}`}
                          style={[styles.subcategoryChip, isSelected && styles.subcategoryChipSelected]}
                          onPress={() => toggleSubcategory(subcategory.id as SubcategoryId)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.subcategoryChipIcon}>{subcategory.icon}</Text>
                          <Text style={[styles.subcategoryChipLabel, isSelected && styles.subcategoryChipLabelSelected]}>{subcategory.title}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          {tazaFairSummary && (
            <View style={[styles.summaryCard, { backgroundColor: tazaFairSummary.avgBand.background }]}
              testID="tazafair-summary-card"
            >
              <View style={styles.summaryHeader}>
                <Stars color={tazaFairSummary.avgBand.color} size={18} strokeWidth={2.4} />
                <Text style={[styles.summaryBadge, { color: tazaFairSummary.avgBand.color }]}>TazaFair • {tazaFairSummary.avgIndex}%</Text>
              </View>
              <Text style={styles.summaryTitle}>{tazaFairSummary.avgBand.label}</Text>
              <Text style={styles.summarySubtitle}>{tazaFairSummary.avgBand.subtitle}</Text>
              <View style={styles.summaryMetaRow}>
                <View style={styles.summaryPill}>
                  <Info color="#1E293B" size={14} strokeWidth={2.4} />
                  <Text style={styles.summaryPillText}>
                    {tazaFairSummary.total} услуг • {tazaFairSummary.belowMarketCount} ниже рынка
                  </Text>
                </View>
                <View style={styles.summaryPill}>
                  <Crown color="#1E293B" size={14} strokeWidth={2.4} />
                  <Text style={styles.summaryPillText}>{tazaFairSummary.premiumCount} премиум позиций</Text>
                </View>
              </View>
              {tazaFairSummary.worst && (
                <View style={styles.summaryWorstRow}>
                  <View style={styles.summaryWorstIcon}>
                    <Text style={styles.summaryWorstEmoji}>{tazaFairSummary.worst.subcategory.icon}</Text>
                  </View>
                  <View style={styles.summaryWorstText}>
                    <Text style={styles.summaryWorstTitle}>{tazaFairSummary.worst.subcategory.title}</Text>
                    <Text style={styles.summaryWorstSubtitle}>
                      {tazaFairSummary.worst.evaluation.band.recommendationHint}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {evaluatedSubcategories.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Шаг 2: Настройте цены</Text>
              {evaluatedSubcategories.map((item) => {
                const isRecommended = item.price === item.recommended;
                const deltaLabel = item.evaluation.deltaPercent > 0
                  ? `+${item.evaluation.deltaPercent}% к рынку`
                  : `${item.evaluation.deltaPercent}% от рынка`;
                const deltaColor = item.evaluation.deltaPercent >= 0 ? '#2563EB' : '#FF5A64';
                const inputValue = subcategoryPriceInputs[item.subcategoryId] ?? formatPriceInputFromNumber(item.price);
                return (
                  <View key={item.subcategoryId} style={styles.priceCard} testID={`price-card-${item.subcategoryId}`}>
                    <View style={styles.priceHeader}>
                      <View style={styles.priceHeaderLeft}>
                        <View style={styles.priceIconBubble}>
                          <Text style={styles.priceIcon}>{item.subcategory.icon}</Text>
                        </View>
                        <View style={styles.priceTitleBlock}>
                          <Text style={styles.priceTitle}>{item.subcategory.title}</Text>
                          <Text style={styles.priceNote}>{item.note}</Text>
                        </View>
                      </View>
                      <View style={[styles.fairBadge, { backgroundColor: item.evaluation.band.background }]}
                        testID={`fairness-badge-${item.subcategoryId}`}
                      >
                        <Text style={[styles.fairBadgeText, { color: item.evaluation.band.color }]}>
                          {item.evaluation.band.icon} {item.evaluation.band.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.priceInputRow}>
                      <View style={styles.priceInputGroup}>
                        <TextInput
                          testID={`price-input-${item.subcategoryId}`}
                          style={styles.priceInput}
                          value={inputValue}
                          onChangeText={(value) => updateSubcategoryPrice(item.subcategoryId, value)}
                          keyboardType={numericKeyboardType}
                          inputMode="numeric"
                          placeholder="0"
                          placeholderTextColor="#99A1B7"
                        />
                        <Text style={styles.currency}>₸</Text>
                      </View>
                      <TouchableOpacity
                        testID={`price-recommend-${item.subcategoryId}`}
                        style={[styles.recommendationButton, isRecommended && styles.recommendationButtonDisabled]}
                        onPress={() => applyRecommendedPrice(item.subcategoryId, item.recommended)}
                        disabled={isRecommended}
                        activeOpacity={0.85}
                      >
                        <Wand2 color={isRecommended ? '#94A3B8' : '#2563EB'} size={16} strokeWidth={2.6} />
                        <Text style={[styles.recommendationText, isRecommended && styles.recommendationTextDisabled]}>
                          {isRecommended ? 'Цена соответствует рынку' : `Рекомендовано ${formatNumber(item.recommended)} ₸`}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.priceMetaRow}>
                      <View style={styles.priceMetaPill}>
                        {item.evaluation.deltaPercent >= 0 ? (
                          <TrendingUp color={deltaColor} size={16} strokeWidth={2.4} />
                        ) : (
                          <TrendingDown color={deltaColor} size={16} strokeWidth={2.4} />
                        )}
                        <Text style={[styles.priceMetaText, { color: deltaColor }]}>{deltaLabel}</Text>
                      </View>
                      <Text style={styles.marketInfo}>
                        Рынок: {formatNumber(item.marketAvg)} ₸ • TazaFair {item.evaluation.index}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            testID="save-profile-button"
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle2 color="#fff" size={20} strokeWidth={2.5} />
                <Text style={styles.saveButtonText}>Сохранить изменения</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E1E1E',
  },
  textArea: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1E1E1E',
    minHeight: 96,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
  },
  categoryLogoBubble: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryContent: {
    alignItems: 'center',
    gap: 4,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categorySubtitleActive: {
    color: '#0F172A',
    fontWeight: '600' as const,
  },
  categoryToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryToggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  subcategorySection: {
    backgroundColor: '#F6F8FC',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  subcategoryHeader: {
    gap: 2,
  },
  subcategoryHeaderTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  subcategoryHeaderHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  subcategoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  subcategoryChipSelected: {
    backgroundColor: '#E9FBF5',
    borderColor: '#00BFA6',
  },
  subcategoryChipIcon: {
    fontSize: 18,
  },
  subcategoryChipLabel: {
    fontSize: 13,
    color: '#1E293B',
  },
  subcategoryChipLabelSelected: {
    color: '#00A389',
    fontWeight: '600' as const,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryBadge: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#334155',
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFFAA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1E293B',
  },
  summaryWorstRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  summaryWorstIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryWorstEmoji: {
    fontSize: 22,
  },
  summaryWorstText: {
    flex: 1,
  },
  summaryWorstTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0F172A',
  },
  summaryWorstSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  priceCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  priceIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceIcon: {
    fontSize: 22,
  },
  priceTitleBlock: {
    flex: 1,
    gap: 4,
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
  },
  priceNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  fairBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fairBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5F5',
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'right',
    paddingRight: 6,
  },
  currency: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
  },
  recommendationButtonDisabled: {
    backgroundColor: '#E2E8F2',
  },
  recommendationText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1E3A8A',
  },
  recommendationTextDisabled: {
    color: '#94A3B8',
  },
  priceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceMetaText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  marketInfo: {
    fontSize: 12,
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#00BFA6',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
