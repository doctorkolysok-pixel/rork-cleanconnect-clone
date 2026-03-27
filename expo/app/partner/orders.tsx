import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Package, Clock, MapPin, AlertCircle } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

type OrderStatus = "new" | "offers_received" | "at_partner" | "partner_working" | "courier_to_partner";

export default function PartnerOrders() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "new" | "active">("new");

  const ordersQuery = trpc.partners.orders.getAll.useQuery();

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  const orders = ordersQuery.data || [];

  const filteredOrders = orders.filter((order) => {
    if (filter === "new") {
      return order.status === "new" || order.status === "offers_received";
    } else if (filter === "active") {
      return order.status === "at_partner" || 
             order.status === "partner_working" || 
             order.status === "courier_to_partner";
    }
    return true;
  });

  const statusColors: Record<OrderStatus, string> = {
    new: "#FF6B6B",
    offers_received: "#FFA726",
    at_partner: "#00BFA6",
    partner_working: "#2196F3",
    courier_to_partner: "#9C27B0",
  };

  const statusLabels: Record<OrderStatus, string> = {
    new: "Новый",
    offers_received: "Получены предложения",
    at_partner: "У партнёра",
    partner_working: "В работе",
    courier_to_partner: "Курьер едет",
  };

  const renderOrder = ({ item }: { item: typeof orders[0] }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/partner/order/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status as OrderStatus] + "20" }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status as OrderStatus] }]}>
            {statusLabels[item.status as OrderStatus]}
          </Text>
        </View>
        <Text style={styles.orderId}>№{item.id.slice(0, 8)}</Text>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderInfo}>
          <Package size={20} color="#666" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <View style={styles.orderInfo}>
          <MapPin size={20} color="#666" />
          <Text style={styles.addressText}>{item.address}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Clock size={20} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString("ru-RU")}
          </Text>
        </View>
      </View>

      {item.comment && (
        <Text style={styles.comment} numberOfLines={2}>
          {item.comment}
        </Text>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.priceText}>{item.priceOffer}₽</Text>
        <Text style={styles.urgencyText}>{item.urgency === "standard" ? "Обычный" : "Срочный"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "new" && styles.filterButtonActive]}
          onPress={() => setFilter("new")}
        >
          <Text style={[styles.filterText, filter === "new" && styles.filterTextActive]}>
            Новые
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "active" && styles.filterButtonActive]}
          onPress={() => setFilter("active")}
        >
          <Text style={[styles.filterText, filter === "active" && styles.filterTextActive]}>
            Активные
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            Все
          </Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет заказов</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#00BFA6",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  orderId: {
    fontSize: 14,
    color: "#666",
  },
  orderBody: {
    gap: 8,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  comment: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic" as const,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#00BFA6",
  },
  urgencyText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#ccc",
    marginTop: 16,
  },
});
