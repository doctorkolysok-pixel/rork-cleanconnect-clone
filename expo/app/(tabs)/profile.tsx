import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { Award, Sparkles, Trophy, TrendingUp, Heart, LogOut, Package } from 'lucide-react-native';
import React from 'react';
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

export default function ProfileScreen() {
  const { user, orders, logout } = useApp();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  if (user.role !== 'client') {
    return null;
  }

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const progress = (user.cleanPoints % 100) / 100;
  const nextLevelPoints = 100 - (user.cleanPoints % 100);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>

        <LinearGradient
          colors={['#00BFA6', '#00A896']}
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
            <Text style={styles.sectionTitle}>Баллы чистоты</Text>
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
            <TrendingUp color="#00BFA6" size={20} />
            <Text style={styles.sectionTitle}>Статистика</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5F3' }]}>
                <Award color="#00BFA6" size={24} />
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



        <TouchableOpacity
          style={styles.subscriptionButton}
          onPress={() => router.push('/laundry-subscription' as any)}
        >
          <View style={styles.subscriptionIcon}>
            <Package color="#fff" size={24} />
          </View>
          <View style={styles.subscriptionContent}>
            <Text style={styles.subscriptionTitle}>Годовой абонемент</Text>
            <Text style={styles.subscriptionSubtitle}>Экономьте до 40% на прачечных</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.charityButton}
          onPress={() => router.push('/charity' as any)}
        >
          <View style={styles.charityIcon}>
            <Heart color="#fff" size={24} fill="#fff" />
          </View>
          <View style={styles.charityContent}>
            <Text style={styles.charityTitle}>Чисто с добром</Text>
            <Text style={styles.charitySubtitle}>Помогите тем, кто нуждается</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          
          <View style={styles.achievementsList}>
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#E8F5F3' }]}>
                <Text style={styles.achievementEmoji}>🎯</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Первый заказ</Text>
                <Text style={styles.achievementDesc}>
                  {orders.length > 0 ? 'Получено ✓' : 'Создайте первый заказ'}
                </Text>
              </View>
            </View>

            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#FFE8F5' }]}>
                <Text style={styles.achievementEmoji}>🌟</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Мастер чистоты</Text>
                <Text style={styles.achievementDesc}>
                  {user.level >= 5 ? 'Получено ✓' : `Достигните 5 уровня`}
                </Text>
              </View>
            </View>

            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#E8F5FF' }]}>
                <Text style={styles.achievementEmoji}>💎</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Верный клиент</Text>
                <Text style={styles.achievementDesc}>
                  {completedCount >= 10 ? 'Получено ✓' : `${completedCount}/10 заказов`}
                </Text>
              </View>
            </View>
          </View>
        </View>

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
    color: '#00BFA6',
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
    color: '#00BFA6',
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
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
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
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#999',
  },
  subscriptionButton: {
    flexDirection: 'row',
    backgroundColor: '#00BFA6',
    marginHorizontal: 16,
    marginBottom: 12,
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
  subscriptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  charityButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4081',
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
  charityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  charityContent: {
    flex: 1,
  },
  charityTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  charitySubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
  demoButton: {
    flexDirection: 'row',
    backgroundColor: '#7C4DFF',
    marginHorizontal: 16,
    marginBottom: 12,
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
  demoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#5C6BC0',
    marginHorizontal: 16,
    marginBottom: 12,
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
});
