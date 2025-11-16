import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Package, MapPin, Clock, Navigation, Building2, Users } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function CourierDeliveries() {
  const router = useRouter();

  const deliveriesQuery = trpc.couriers.deliveries.getAll.useQuery({ status: undefined });

  if (deliveriesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  const deliveries = deliveriesQuery.data || [];
  const activeDeliveries = deliveries.filter(
    (d) => d.status === "accepted" || d.status === "picked_up" || d.status === "in_transit"
  );
  const availableDeliveries = deliveries.filter((d) => d.status === "assigned");

  const statusColors = {
    assigned: "#FFA726",
    accepted: "#2196F3",
    picked_up: "#9C27B0",
    in_transit: "#00BFA6",
    delivered: "#4CAF50",
    cancelled: "#FF6B6B",
  };

  const statusLabels = {
    assigned: "Назначен",
    accepted: "Принят",
    picked_up: "Забрал",
    in_transit: "В пути",
    delivered: "В точке",
    cancelled: "Отменён",
  };

  const renderDelivery = (delivery: typeof deliveries[0]) => (
    <TouchableOpacity
      key={delivery.id}
      style={styles.deliveryCard}
      onPress={() => router.push(`/courier/delivery/${delivery.id}`)}
    >
      <View style={styles.deliveryHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[delivery.status] + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors[delivery.status] }]}>
            {statusLabels[delivery.status]}
          </Text>
        </View>
        <Text style={styles.deliveryType}>
          {delivery.type === "to_partner" ? "К партнёру" : "Клиенту"}
        </Text>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <MapPin size={16} color="#FF6B6B" />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Забрать</Text>
            <Text style={styles.addressText}>{delivery.pickupAddress}</Text>
          </View>
        </View>

        <View style={styles.addressDivider}>
          <Navigation size={16} color="#ccc" />
        </View>

        <View style={styles.addressRow}>
          <MapPin size={16} color="#4CAF50" />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Доставить</Text>
            <Text style={styles.addressText}>{delivery.deliveryAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.deliveryFooter}>
        <View style={styles.footerInfo}>
          <Package size={16} color="#666" />
          <Text style={styles.footerText}>{delivery.orderCategory}</Text>
        </View>

        <Text style={styles.priceText}>{delivery.price}₽</Text>
      </View>

      {delivery.estimatedTime && (
        <View style={styles.estimatedTime}>
          <Clock size={14} color="#888" />
          <Text style={styles.estimatedTimeText}>{delivery.estimatedTime}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Активные доставки ({activeDeliveries.length})</Text>
        {activeDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет активных доставок</Text>
          </View>
        ) : (
          activeDeliveries.map(renderDelivery)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Доступные доставки ({availableDeliveries.length})
        </Text>
        {availableDeliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет доступных доставок</Text>
          </View>
        ) : (
          availableDeliveries.map(renderDelivery)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Коммуникация</Text>
        
        <View style={styles.communicationGrid}>
          <TouchableOpacity
            style={styles.communicationCard}
            onPress={() => router.push("/communication/partners")}
          >
            <Building2 size={32} color="#00BFA6" />
            <Text style={styles.communicationTitle}>Партнёры</Text>
            <Text style={styles.communicationDesc}>Пункты приёма</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.communicationCard}
            onPress={() => router.push("/communication/couriers")}
          >
            <Users size={32} color="#5C6BC0" />
            <Text style={styles.communicationTitle}>Коллеги</Text>
            <Text style={styles.communicationDesc}>Другие курьеры</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  deliveryType: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600" as const,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: "row",
    gap: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  addressDivider: {
    paddingLeft: 2,
    paddingVertical: 8,
  },
  deliveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#00BFA6",
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  estimatedTimeText: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
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
