import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Plus, Edit2, Trash2, TrendingDown, TrendingUp, DollarSign } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PartnerServices() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<"clothing" | "furniture" | "shoes" | "carpets" | "cleaning" | "strollers">("clothing");
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [description, setDescription] = useState("");

  const servicesQuery = trpc.partners.services.getAll.useQuery({ partnerId: undefined });
  const createService = trpc.partners.services.create.useMutation({
    onSuccess: () => {
      servicesQuery.refetch();
      setShowAddModal(false);
      setServiceName("");
      setPrice("");
      setEstimatedTime("");
      setDescription("");
      Alert.alert("Успех", "Услуга добавлена");
    },
  });

  const services = servicesQuery.data || [];

  const handleAddService = () => {
    if (!serviceName || !price || !estimatedTime) {
      Alert.alert("Ошибка", "Заполните все обязательные поля");
      return;
    }

    createService.mutate({
      serviceName,
      category,
      price: parseFloat(price),
      description,
      estimatedTime,
    });
  };

  const priceIndicatorIcons = {
    low: { icon: TrendingDown, color: "#FF6B6B" },
    optimal: { icon: DollarSign, color: "#4CAF50" },
    premium: { icon: TrendingUp, color: "#FFD700" },
  };

  if (servicesQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </SafeAreaView>
    );
  }

  if (showAddModal) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Добавить услугу</Text>

          <Text style={styles.label}>Название услуги *</Text>
          <TextInput
            style={styles.input}
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Например: Химчистка пальто"
          />

          <Text style={styles.label}>Категория *</Text>
          <View style={styles.categoryGrid}>
            {["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat as typeof category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Цена *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="1000"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Время выполнения *</Text>
          <TextInput
            style={styles.input}
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            placeholder="2-3 дня"
          />

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Описание услуги..."
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={handleAddService}
              disabled={createService.isPending}
            >
              {createService.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Добавить</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Мои услуги</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Добавить</Text>
          </TouchableOpacity>
        </View>

        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет добавленных услуг</Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {services.map((service) => {
              const indicator = priceIndicatorIcons[service.priceQualityIndicator];
              const Icon = indicator.icon;

              return (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.serviceName}</Text>
                    <View style={[styles.priceIndicator, { backgroundColor: indicator.color + "20" }]}>
                      <Icon size={16} color={indicator.color} />
                    </View>
                  </View>

                  <Text style={styles.serviceCategory}>{service.category}</Text>

                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Цена</Text>
                      <Text style={styles.serviceDetailValue}>{service.price}₽</Text>
                    </View>

                    <View style={styles.serviceDetail}>
                      <Text style={styles.serviceDetailLabel}>Время</Text>
                      <Text style={styles.serviceDetailValue}>{service.estimatedTime}</Text>
                    </View>
                  </View>

                  {service.avgMarketPrice && (
                    <Text style={styles.marketPrice}>
                      Средняя цена по рынку: {service.avgMarketPrice.toFixed(0)}₽
                    </Text>
                  )}

                  {service.description && (
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  )}

                  <View style={styles.serviceActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Edit2 size={18} color="#00BFA6" />
                      <Text style={styles.actionButtonText}>Редактировать</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00BFA6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  servicesList: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    flex: 1,
  },
  priceIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  serviceDetail: {
    flex: 1,
  },
  serviceDetailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  serviceDetailValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  marketPrice: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  serviceActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#00BFA6",
    fontWeight: "600" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  categoryButtonActive: {
    backgroundColor: "#00BFA6",
    borderColor: "#00BFA6",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
});
