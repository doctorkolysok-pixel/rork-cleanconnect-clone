import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bike, Phone, Mail, Star, CheckCircle, MapPin, Package } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { LinearGradient } from "expo-linear-gradient";

const VEHICLE_ICONS = {
  bike: "🚲",
  scooter: "🛵",
  car: "🚗",
  van: "🚚",
};

const VEHICLE_NAMES = {
  bike: "Велосипед",
  scooter: "Скутер",
  car: "Автомобиль",
  van: "Фургон",
};

export default function CouriersListScreen() {
  const router = useRouter();
  const couriersQuery = trpc.communication.getCouriers.useQuery();

  const couriers = couriersQuery.data || [];

  if (couriersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C6BC0" />
        <Text style={styles.loadingText}>Загрузка курьеров...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Курьеры</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Служба доставки</Text>
          <Text style={styles.infoDesc}>
            Здесь вы можете найти курьеров для доставки заказов
            между клиентами и партнёрами
          </Text>
        </View>

        {couriers.length === 0 ? (
          <View style={styles.emptyState}>
            <Bike color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>Нет доступных курьеров</Text>
            <Text style={styles.emptyDesc}>
              Курьеры появятся после регистрации в системе
            </Text>
          </View>
        ) : (
          <View style={styles.couriersList}>
            {couriers.map((courier) => (
              <TouchableOpacity
                key={courier.id}
                style={styles.courierCard}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#5C6BC0", "#3F51B5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.courierHeader}
                >
                  <View style={styles.courierIcon}>
                    <Text style={styles.courierEmoji}>
                      {VEHICLE_ICONS[courier.vehicleType]}
                    </Text>
                  </View>
                  <View style={styles.courierHeaderContent}>
                    <Text style={styles.courierName}>{courier.name}</Text>
                    <View style={styles.ratingRow}>
                      <Star color="#FFD700" size={16} fill="#FFD700" />
                      <Text style={styles.ratingText}>{courier.rating.toFixed(1)}</Text>
                      {courier.isVerified && (
                        <View style={styles.verifiedBadge}>
                          <CheckCircle color="#4CAF50" size={14} />
                          <Text style={styles.verifiedText}>Проверен</Text>
                        </View>
                      )}
                      {courier.isOnline && (
                        <View style={styles.onlineBadge}>
                          <View style={styles.onlineDot} />
                          <Text style={styles.onlineText}>Онлайн</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.courierBody}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Package color="#5C6BC0" size={20} />
                      <Text style={styles.statValue}>{courier.totalDeliveries}</Text>
                      <Text style={styles.statLabel}>доставок</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Bike color="#5C6BC0" size={20} />
                      <Text style={styles.statValue}>{VEHICLE_NAMES[courier.vehicleType]}</Text>
                      <Text style={styles.statLabel}>транспорт</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <MapPin color="#666" size={18} />
                    <Text style={styles.infoText}>{courier.city}</Text>
                  </View>

                  {courier.phone && (
                    <TouchableOpacity style={styles.infoRow}>
                      <Phone color="#5C6BC0" size={18} />
                      <Text style={[styles.infoText, styles.linkText]}>
                        {courier.phone}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {courier.email && (
                    <TouchableOpacity style={styles.infoRow}>
                      <Mail color="#5C6BC0" size={18} />
                      <Text style={[styles.infoText, styles.linkText]}>
                        {courier.email}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#5C6BC0",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#E8EAF6",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#5C6BC0",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1E1E1E",
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#999",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  couriersList: {
    padding: 16,
    gap: 16,
  },
  courierCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  courierHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  courierIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  courierEmoji: {
    fontSize: 32,
  },
  courierHeaderContent: {
    flex: 1,
  },
  courierName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  courierBody: {
    padding: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1E1E1E",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  linkText: {
    color: "#5C6BC0",
    fontWeight: "600" as const,
  },
});
