import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { DollarSign, TrendingUp, Clock, Package } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function PartnerFinances() {
  const [period] = useState<"all" | "month" | "week">("all");

  const financesQuery = trpc.partners.finances.getAll.useQuery({
    startDate: undefined,
    endDate: undefined,
  });

  if (financesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  const data = financesQuery.data;
  const finances = data?.finances || [];
  const summary = data?.summary;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, styles.primaryCard]}>
          <DollarSign size={32} color="#fff" />
          <Text style={styles.summaryValue}>
            {summary?.totalEarnings?.toFixed(0) || "0"}₽
          </Text>
          <Text style={styles.summaryLabel}>Всего заработано</Text>
        </View>

        <View style={[styles.summaryCard, styles.secondaryCard]}>
          <Clock size={32} color="#fff" />
          <Text style={styles.summaryValue}>
            {summary?.pendingAmount?.toFixed(0) || "0"}₽
          </Text>
          <Text style={styles.summaryLabel}>В ожидании</Text>
        </View>

        <View style={[styles.summaryCard, styles.successCard]}>
          <TrendingUp size={32} color="#fff" />
          <Text style={styles.summaryValue}>
            {summary?.paidAmount?.toFixed(0) || "0"}₽
          </Text>
          <Text style={styles.summaryLabel}>Выплачено</Text>
        </View>

        <View style={[styles.summaryCard, styles.accentCard]}>
          <Package size={32} color="#fff" />
          <Text style={styles.summaryValue}>{finances.length}</Text>
          <Text style={styles.summaryLabel}>Заказов</Text>
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>История операций</Text>

        {finances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет операций</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {finances.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionId}>
                    Заказ №{transaction.orderId.slice(0, 8)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      transaction.status === "paid"
                        ? styles.statusPaid
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        transaction.status === "paid"
                          ? styles.statusTextPaid
                          : styles.statusTextPending,
                      ]}
                    >
                      {transaction.status === "paid" ? "Выплачено" : "В ожидании"}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Сумма заказа</Text>
                    <Text style={styles.detailValue}>{transaction.amount}₽</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Комиссия платформы</Text>
                    <Text style={[styles.detailValue, styles.feeValue]}>
                      -{transaction.platformFee}₽
                    </Text>
                  </View>

                  <View style={[styles.detailRow, styles.netRow]}>
                    <Text style={styles.netLabel}>К выплате</Text>
                    <Text style={styles.netValue}>{transaction.netAmount}₽</Text>
                  </View>
                </View>

                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleString("ru-RU")}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  summarySection: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  summaryCard: {
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
    backgroundColor: "#FFA726",
  },
  successCard: {
    backgroundColor: "#4CAF50",
  },
  accentCard: {
    backgroundColor: "#2196F3",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
    textAlign: "center",
  },
  historySection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: "#4CAF5020",
  },
  statusPending: {
    backgroundColor: "#FFA72620",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusTextPaid: {
    color: "#4CAF50",
  },
  statusTextPending: {
    color: "#FFA726",
  },
  transactionDetails: {
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600" as const,
  },
  feeValue: {
    color: "#FF6B6B",
  },
  netRow: {
    marginTop: 4,
  },
  netLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  netValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#00BFA6",
  },
  transactionDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
  },
});
