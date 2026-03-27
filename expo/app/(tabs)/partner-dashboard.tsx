import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Package, Clock, TrendingUp, DollarSign, Users, Building2, Bike } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "expo-router";

export default function PartnerDashboard() {
  const { user } = useApp();
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const ordersQuery = trpc.partners.orders.getAll.useQuery();
  const financesQuery = trpc.partners.finances.getAll.useQuery({ startDate: undefined, endDate: undefined });

  const orders = ordersQuery.data || [];
  const finances = financesQuery.data;

  const pendingOrders = orders.filter(o => o.status === "new" || o.status === "offers_received");
  const activeOrders = orders.filter(o => 
    o.status === "at_partner" || 
    o.status === "partner_working" || 
    o.status === "courier_to_partner"
  );
  const completedOrders = orders.filter(o => o.status === "completed");

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Привет, {user.name}!</Text>
        <Text style={styles.subtitle}>Панель партнёра</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Package size={28} color="#fff" />
          <Text style={styles.statNumber}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>Новые заказы</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Clock size={28} color="#fff" />
          <Text style={styles.statNumber}>{activeOrders.length}</Text>
          <Text style={styles.statLabel}>В работе</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <TrendingUp size={28} color="#fff" />
          <Text style={styles.statNumber}>{completedOrders.length}</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>

        <View style={[styles.statCard, styles.accentCard]}>
          <DollarSign size={28} color="#fff" />
          <Text style={styles.statNumber}>
            {finances?.summary?.totalEarnings?.toFixed(0) || "0"}₽
          </Text>
          <Text style={styles.statLabel}>Заработано</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/partner/orders")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Package size={24} color="#00BFA6" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Входящие заказы</Text>
              <Text style={styles.actionSubtitle}>{pendingOrders.length} новых</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/partner/services")}
        >
          <TrendingUp size={24} color="#00BFA6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Мои услуги</Text>
            <Text style={styles.actionSubtitle}>Управление прайс-листом</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/partner/finances")}
        >
          <DollarSign size={24} color="#00BFA6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Финансы</Text>
            <Text style={styles.actionSubtitle}>
              {finances?.summary?.pendingAmount?.toFixed(0) || "0"}₽ в ожидании
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Коммуникация</Text>
        
        <View style={styles.communicationGrid}>
          <TouchableOpacity 
            style={styles.communicationCard}
            onPress={() => router.push("/communication/partners")}
          >
            <Building2 size={32} color="#00BFA6" />
            <Text style={styles.communicationTitle}>Партнёры</Text>
            <Text style={styles.communicationDesc}>Другие пункты приёма</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.communicationCard}
            onPress={() => router.push("/communication/couriers")}
          >
            <Bike size={32} color="#5C6BC0" />
            <Text style={styles.communicationTitle}>Курьеры</Text>
            <Text style={styles.communicationDesc}>Служба доставки</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#00BFA6",
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0F2F1",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: "#00BFA6",
  },
  secondaryCard: {
    backgroundColor: "#FF6B6B",
  },
  successCard: {
    backgroundColor: "#4CAF50",
  },
  accentCard: {
    backgroundColor: "#FFA726",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  communicationGrid: {
    flexDirection: "row",
    gap: 12,
  },
  communicationCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communicationTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  communicationDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
