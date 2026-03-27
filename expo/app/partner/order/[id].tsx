import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import {
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Camera,
  TrendingUp,
  Truck,
} from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderAction = "accept" | "reject" | "clarify";

export default function PartnerOrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<OrderAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [clarificationMessage, setClarificationMessage] = useState("");

  const orderQuery = trpc.partners.orders.getById.useQuery({ orderId: id });
  const acceptOrder = trpc.partners.orders.accept.useMutation({
    onSuccess: () => {
      Alert.alert("Успех", "Заказ принят в работу");
      orderQuery.refetch();
      setShowActionModal(false);
    },
    onError: (error) => {
      Alert.alert("Ошибка", error.message);
    },
  });

  const rejectOrder = trpc.partners.orders.reject.useMutation({
    onSuccess: () => {
      Alert.alert("Успех", "Заказ отклонён");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Ошибка", error.message);
    },
  });

  const updateStatus = trpc.partners.orders.updateStatus.useMutation({
    onSuccess: () => {
      Alert.alert("Успех", "Статус обновлён");
      orderQuery.refetch();
    },
  });

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </SafeAreaView>
    );
  }

  if (!orderQuery.data) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Заказ не найден</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  const handleAction = (action: OrderAction) => {
    setCurrentAction(action);
    setShowActionModal(true);
  };

  const handleConfirmAction = () => {
    if (!currentAction) return;

    if (currentAction === "accept") {
      acceptOrder.mutate({ orderId: id });
    } else if (currentAction === "reject") {
      if (!rejectReason.trim()) {
        Alert.alert("Ошибка", "Укажите причину отказа");
        return;
      }
      rejectOrder.mutate({ orderId: id, reason: rejectReason });
    } else if (currentAction === "clarify") {
      if (!clarificationMessage.trim()) {
        Alert.alert("Ошибка", "Введите сообщение для клиента");
        return;
      }
      Alert.alert("Успех", "Запрос на уточнение отправлен клиенту");
      setShowActionModal(false);
      setClarificationMessage("");
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ orderId: id, status: newStatus });
  };

  const statusColors: Record<string, string> = {
    new: "#FF6B6B",
    offers_received: "#FFA726",
    at_partner: "#00BFA6",
    partner_working: "#2196F3",
    partner_done: "#4CAF50",
    courier_to_partner: "#9C27B0",
    courier_to_client: "#673AB7",
  };

  const statusLabels: Record<string, string> = {
    new: "Новый",
    offers_received: "Получены предложения",
    at_partner: "Принято",
    partner_working: "В цехе / На чистке",
    partner_done: "Готово",
    courier_to_partner: "Курьер едет к вам",
    courier_to_client: "Курьер везёт клиенту",
  };

  const canAccept = order.status === "new" || order.status === "offers_received";
  const canStartWork = order.status === "at_partner";
  const canMarkDone = order.status === "partner_working";

  return (
    <>
      <Stack.Screen options={{ title: `Заказ №${id.slice(0, 8)}`, headerBackTitle: "Назад" }} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView style={styles.content}>
          <View
            style={[
              styles.statusCard,
              { backgroundColor: statusColors[order.status] + "20" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: statusColors[order.status] }]}
            >
              {statusLabels[order.status]}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Информация о заказе</Text>

            <View style={styles.infoRow}>
              <Package size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Категория</Text>
                <Text style={styles.infoValue}>{order.category}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Адрес</Text>
                <Text style={styles.infoValue}>{order.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Clock size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Срочность</Text>
                <Text style={styles.infoValue}>
                  {order.urgency === "standard"
                    ? "Обычный"
                    : order.urgency === "fast"
                    ? "Быстрый"
                    : order.urgency === "urgent"
                    ? "Срочный"
                    : "Экспресс"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <TrendingUp size={20} color="#00BFA6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Предложенная цена</Text>
                <Text style={styles.priceValue}>{order.priceOffer}₽</Text>
              </View>
            </View>
          </View>

          {order.comment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Комментарий клиента</Text>
              <Text style={styles.commentText}>{order.comment}</Text>
            </View>
          )}

          {order.photos && order.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Фотографии</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosContainer}>
                  {order.photos.map((photo: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.photo}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Контакты клиента</Text>

            <View style={styles.infoRow}>
              <User size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Имя</Text>
                <Text style={styles.infoValue}>{order.userName || "—"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Phone size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Телефон</Text>
                <Text style={styles.infoValue}>{order.userPhone || "—"}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push(`/chat/${id}`)}
            >
              <MessageCircle size={20} color="#00BFA6" />
              <Text style={styles.chatButtonText}>Написать клиенту</Text>
            </TouchableOpacity>
          </View>

          {order.courierId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Информация о курьере</Text>
              <View style={styles.courierCard}>
                <Truck size={24} color="#00BFA6" />
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>
                    {order.courierName || "Курьер"}
                  </Text>
                  <Text style={styles.courierPhone}>
                    {order.courierPhone || "—"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => router.push(`/delivery/${order.deliveryId}`)}
                >
                  <Text style={styles.trackButtonText}>Отследить</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {order.status === "partner_working" && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() =>
                  router.push(`/partner/order/${id}/upload-photos`)
                }
              >
                <Camera size={20} color="#fff" />
                <Text style={styles.photoButtonText}>Загрузить фото работы</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {canAccept && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAction("reject")}
            >
              <XCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Отказать</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.clarifyButton]}
              onPress={() => handleAction("clarify")}
            >
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Уточнить</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAction("accept")}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Принять</Text>
            </TouchableOpacity>
          </View>
        )}

        {canStartWork && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.workButton]}
              onPress={() => handleStatusChange("partner_working")}
            >
              <TrendingUp size={20} color="#fff" />
              <Text style={styles.actionButtonText}>В цехе / На чистке</Text>
            </TouchableOpacity>
          </View>
        )}

        {canMarkDone && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.photoButton2]}
              onPress={() =>
                router.push(`/partner/order/${id}/upload-photos`)
              }
            >
              <Camera size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Загрузить фото</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={() => handleStatusChange("partner_done")}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Готово</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={showActionModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowActionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {currentAction === "accept"
                  ? "Принять заказ?"
                  : currentAction === "reject"
                  ? "Отказать в заказе"
                  : "Запросить уточнение"}
              </Text>

              {currentAction === "reject" && (
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Укажите причину отказа..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={4}
                />
              )}

              {currentAction === "clarify" && (
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Что нужно уточнить у клиента?"
                  value={clarificationMessage}
                  onChangeText={setClarificationMessage}
                  multiline
                  numberOfLines={4}
                />
              )}

              {currentAction === "accept" && (
                <Text style={styles.modalDescription}>
                  Вы подтверждаете, что готовы принять этот заказ в работу?
                </Text>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setShowActionModal(false);
                    setRejectReason("");
                    setClarificationMessage("");
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Отмена</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleConfirmAction}
                  disabled={
                    acceptOrder.isPending ||
                    rejectOrder.isPending ||
                    updateStatus.isPending
                  }
                >
                  {acceptOrder.isPending ||
                  rejectOrder.isPending ||
                  updateStatus.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmButtonText}>
                      Подтвердить
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500" as const,
  },
  priceValue: {
    fontSize: 20,
    color: "#00BFA6",
    fontWeight: "700" as const,
  },
  commentText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  photosContainer: {
    flexDirection: "row",
    gap: 12,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2F1",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    color: "#00BFA6",
    fontWeight: "600" as const,
  },
  courierCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 8,
  },
  courierInfo: {
    marginLeft: 12,
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  courierPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  trackButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#FF6B6B",
  },
  clarifyButton: {
    backgroundColor: "#FFA726",
  },
  workButton: {
    backgroundColor: "#2196F3",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
  },
  photoButton2: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#E0E0E0",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
  modalConfirmButton: {
    backgroundColor: "#00BFA6",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
