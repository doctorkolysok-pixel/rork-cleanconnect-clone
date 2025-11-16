import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { Award, Sparkles, Trophy, TrendingUp, LogOut, Settings, LineChart, Target, Users, Building2, Bike } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORIES } from '@/constants/categories';
import { SUBCATEGORIES, SubcategoryId, SubcategoryInfo } from '@/constants/subcategories';
import { OrderCategory } from '@/types';

const SUBCATEGORY_LOOKUP: Record<SubcategoryId, SubcategoryInfo> = Object.values(SUBCATEGORIES)
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

const formatPrice = (value: number) => value.toLocaleString('ru-RU');

interface ServiceGroupItem {
  id: SubcategoryId;
  title: string;
  icon: string;
  price: number;
}

interface ServiceGroup {
  categoryId: OrderCategory;
  categoryTitle: string;
  categoryIcon: string;
  accent: string;
  tint: string;
  items: ServiceGroupItem[];
  total: number;
}

export default function CleanerProfileScreen() {
  const { user, orders, logout, deliveries } = useApp();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  const serviceGroups = useMemo<ServiceGroup[]>(() => {
    if (!user.servicePrices) {
      console.log('[CleanerProfileScreen] No service prices configured');
      return [];
    }

    const groups = new Map<OrderCategory, ServiceGroup>();

    Object.entries(user.servicePrices).forEach(([subIdKey, priceValue]) => {
      const subId = subIdKey as SubcategoryId;
      const subcategory = SUBCATEGORY_LOOKUP[subId];

      if (!subcategory) {
        console.log('[CleanerProfileScreen] Unknown subcategory skipped', { subId });
        return;
      }

      const categoryInfo = CATEGORIES.find(item => item.id === subcategory.parentCategory);
      const tokens = CATEGORY_TOKENS[subcategory.parentCategory];

      if (!categoryInfo || !tokens) {
        console.log('[CleanerProfileScreen] Missing category info', { category: subcategory.parentCategory });
        return;
      }

      const numericPrice = typeof priceValue === 'number' ? priceValue : Number(priceValue);
      const normalizedPrice = Number.isFinite(numericPrice) ? numericPrice : 0;

      if (!groups.has(subcategory.parentCategory)) {
        groups.set(subcategory.parentCategory, {
          categoryId: subcategory.parentCategory,
          categoryTitle: categoryInfo.titleRu,
          categoryIcon: categoryInfo.icon,
          accent: tokens.accent,
          tint: tokens.tint,
          items: [],
          total: 0,
        });
      }

      const group = groups.get(subcategory.parentCategory);

      if (group) {
        group.items.push({
          id: subId,
          title: subcategory.title,
          icon: subcategory.icon,
          price: normalizedPrice,
        });
        group.total += normalizedPrice;
      }
    });

    const result = Array.from(groups.values()).map(group => ({
      ...group,
      items: [...group.items].sort((a, b) => a.title.localeCompare(b.title)),
    })).sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle));

    console.log('[CleanerProfileScreen] Service groups prepared', { count: result.length });
    return result;
  }, [user.servicePrices]);

  if (user.role === 'client') {
    return null;
  }

  const isCleaner = user.role === 'cleaner';
  const isCourier = user.role === 'courier';

  const completedCount = isCourier
    ? deliveries.filter(d => d.courierId === user.id && d.status === 'delivered').length
    : orders.filter(o => o.status === 'completed' && o.chosenCleanerId === 'cleaner-1').length;
  const progress = (user.cleanPoints % 100) / 100;
  const nextLevelPoints = 100 - (user.cleanPoints % 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}
      testID="cleaner-profile-screen"
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>

        <LinearGradient
          colors={['#5C6BC0', '#3F51B5']}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profilePhone}>{user.phone}</Text>
          
          <View style={styles.levelBadge}>
            <Trophy color="#FFD700" size={16} />
            <Text style={styles.levelText}>Уровень {user.level}</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles color="#FFD700" size={20} />
            <Text style={styles.sectionTitle}>Баллы репутации</Text>
          </View>
          
          <View style={styles.pointsCard}>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Текущий уровень</Text>
              <Text style={styles.pointsValue}>{user.cleanPoints} баллов</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {nextLevelPoints} до уровня {user.level + 1}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp color="#5C6BC0" size={20} />
            <Text style={styles.sectionTitle}>Статистика</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8EAF6' }]}>
                <Award color="#5C6BC0" size={24} />
              </View>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Завершено</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF8E1' }]}>
                <Trophy color="#FFD700" size={24} />
              </View>
              <Text style={styles.statValue}>{user.level}</Text>
              <Text style={styles.statLabel}>Уровень</Text>
            </View>
          </View>
        </View>

        {isCleaner && (
          <TouchableOpacity
            style={styles.businessButton}
            onPress={() => {
              console.log('[CleanerProfileScreen] openBusinessTools');
              router.push('/business-tools' as any);
            }}
            activeOpacity={0.85}
            testID="open-business-tools"
          >
            <LinearGradient
              colors={['#122B59', '#1F4B7C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.businessGradient}
            >
              <View style={styles.businessIconBubble}>
                <LineChart color="#fff" size={26} />
              </View>
              <View style={styles.businessContent}>
                <Text style={styles.businessTitle}>Бизнес утилиты</Text>
                <Text style={styles.businessSubtitle}>Цели, прибыль, TazaFair контроль</Text>
              </View>
              <View style={styles.businessArrow}>
                <Target color="#fff" size={22} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {serviceGroups.length > 0 && (
          <View style={styles.section}
            testID="service-prices-section"
          >
            <View style={styles.sectionHeader}>
              <Sparkles color="#5C6BC0" size={20} />
              <Text style={styles.sectionTitle}>Мои услуги и цены</Text>
            </View>
            <View style={styles.serviceGroupList}>
              {serviceGroups.map(group => (
                <View
                  key={group.categoryId}
                  style={[styles.serviceGroupCard, { borderColor: group.accent }]}
                  testID={`service-group-${group.categoryId}`}
                >
                  <View style={styles.serviceGroupHeader}>
                    <View style={[styles.serviceGroupIcon, { backgroundColor: group.tint }]}>
                      <Text style={styles.serviceGroupEmoji}>{group.categoryIcon}</Text>
                    </View>
                    <View style={styles.serviceGroupTitleBlock}>
                      <Text style={styles.serviceGroupTitle}>{group.categoryTitle}</Text>
                      <Text style={styles.serviceGroupSubtitle}>
                        {group.items.length} услуг • {formatPrice(group.total)} ₸
                      </Text>
                    </View>
                  </View>
                  <View style={styles.serviceItemsList}>
                    {group.items.map(item => (
                      <View
                        key={item.id}
                        style={styles.serviceItemRow}
                        testID={`service-price-${item.id}`}
                      >
                        <View style={styles.serviceItemLeft}>
                          <Text style={styles.serviceItemIcon}>{item.icon}</Text>
                          <Text style={styles.serviceItemTitle}>{item.title}</Text>
                        </View>
                        <Text style={[styles.serviceItemPrice, { color: group.accent }]}>
                          {formatPrice(item.price)} ₸
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#5C6BC0" size={20} />
            <Text style={styles.sectionTitle}>Коммуникация</Text>
          </View>
          
          <View style={styles.communicationGrid}>
            <TouchableOpacity
              style={styles.communicationCard}
              onPress={() => router.push('/communication/partners' as any)}
            >
              <View style={[styles.communicationIcon, { backgroundColor: '#E8F5F3' }]}>
                <Building2 color="#00BFA6" size={28} />
              </View>
              <Text style={styles.communicationTitle}>Партнёры</Text>
              <Text style={styles.communicationDesc}>Пункты приёма</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.communicationCard}
              onPress={() => router.push('/communication/couriers' as any)}
            >
              <View style={[styles.communicationIcon, { backgroundColor: '#E8EAF6' }]}>
                <Bike color="#5C6BC0" size={28} />
              </View>
              <Text style={styles.communicationTitle}>Курьеры</Text>
              <Text style={styles.communicationDesc}>Служба доставки</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isCleaner && (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/cleaner/edit-profile' as any)}
          >
            <View style={styles.editProfileIcon}>
              <Settings color="#fff" size={24} />
            </View>
            <View style={styles.editProfileContent}>
              <Text style={styles.editProfileTitle}>Настройки профиля</Text>
              <Text style={styles.editProfileSubtitle}>Цены, услуги, описание, персонал</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut color="#FF4444" size={20} />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  profileCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#5C6BC0',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1E1E1E',
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 15,
    color: '#666',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#5C6BC0',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FF4444',
  },
  serviceGroupList: {
    gap: 16,
  },
  serviceGroupCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  serviceGroupIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceGroupEmoji: {
    fontSize: 26,
  },
  serviceGroupTitleBlock: {
    flex: 1,
    gap: 4,
  },
  serviceGroupTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  serviceGroupSubtitle: {
    fontSize: 13,
    color: '#475569',
  },
  serviceItemsList: {
    gap: 12,
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  serviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '70%',
  },
  serviceItemIcon: {
    fontSize: 20,
  },
  serviceItemTitle: {
    fontSize: 14,
    color: '#1E293B',
    flexShrink: 1,
  },
  serviceItemPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  businessButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0B1624',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  businessGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  businessIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessContent: {
    flex: 1,
    gap: 6,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#E2E8F0',
  },
  businessSubtitle: {
    fontSize: 13,
    color: '#9FB4D7',
  },
  businessArrow: {
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#5C6BC0',
    marginHorizontal: 16,
    marginBottom: 24,
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
  editProfileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  editProfileContent: {
    flex: 1,
  },
  editProfileTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  editProfileSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  communicationGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  communicationCard: {
    flex: 1,
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
  communicationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  communicationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E1E1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  communicationDesc: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
