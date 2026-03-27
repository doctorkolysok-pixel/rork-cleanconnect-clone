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
import { ArrowLeft, Building2, MapPin, Phone, Mail, Star, CheckCircle } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { LinearGradient } from "expo-linear-gradient";

export default function PartnersListScreen() {
  const router = useRouter();
  const partnersQuery = trpc.communication.getPartners.useQuery();

  const partners = partnersQuery.data || [];

  if (partnersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
        <Text style={styles.loadingText}>Загрузка партнёров...</Text>
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
        <Text style={styles.headerTitle}>Партнёры</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Пункты приёма одежды</Text>
          <Text style={styles.infoDesc}>
            Здесь вы можете найти партнёрские химчистки и прачечные,
            связаться с ними и передать заказы на обработку
          </Text>
        </View>

        {partners.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 color="#ccc" size={64} />
            <Text style={styles.emptyTitle}>Нет доступных партнёров</Text>
            <Text style={styles.emptyDesc}>
              Партнёры появятся после регистрации в системе
            </Text>
          </View>
        ) : (
          <View style={styles.partnersList}>
            {partners.map((partner) => {
              const services = JSON.parse(partner.services || "[]") as string[];
              
              return (
                <TouchableOpacity
                  key={partner.id}
                  style={styles.partnerCard}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#00BFA6", "#00A896"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.partnerHeader}
                  >
                    <View style={styles.partnerIcon}>
                      <Building2 color="#00BFA6" size={28} />
                    </View>
                    <View style={styles.partnerHeaderContent}>
                      <Text style={styles.partnerName}>{partner.businessName}</Text>
                      <View style={styles.ratingRow}>
                        <Star color="#FFD700" size={16} fill="#FFD700" />
                        <Text style={styles.ratingText}>{partner.rating.toFixed(1)}</Text>
                        {partner.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <CheckCircle color="#4CAF50" size={14} />
                            <Text style={styles.verifiedText}>Проверен</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={styles.partnerBody}>
                    <View style={styles.infoRow}>
                      <MapPin color="#666" size={18} />
                      <Text style={styles.infoText}>
                        {partner.address}, {partner.city}
                      </Text>
                    </View>

                    {partner.phone && (
                      <TouchableOpacity style={styles.infoRow}>
                        <Phone color="#00BFA6" size={18} />
                        <Text style={[styles.infoText, styles.linkText]}>
                          {partner.phone}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {partner.email && (
                      <TouchableOpacity style={styles.infoRow}>
                        <Mail color="#00BFA6" size={18} />
                        <Text style={[styles.infoText, styles.linkText]}>
                          {partner.email}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {partner.description && (
                      <Text style={styles.description}>{partner.description}</Text>
                    )}

                    {services.length > 0 && (
                      <View style={styles.servicesSection}>
                        <Text style={styles.servicesTitle}>Услуги:</Text>
                        <View style={styles.servicesTags}>
                          {services.map((service, idx) => (
                            <View key={idx} style={styles.serviceTag}>
                              <Text style={styles.serviceTagText}>{service}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {!partner.isActive && (
                      <View style={styles.inactiveWarning}>
                        <Text style={styles.inactiveText}>
                          Партнёр временно не принимает заказы
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
    backgroundColor: "#00BFA6",
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
    backgroundColor: "#E8F5F3",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00BFA6",
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
  partnersList: {
    padding: 16,
    gap: 16,
  },
  partnerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  partnerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerHeaderContent: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    marginLeft: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  partnerBody: {
    padding: 16,
    gap: 12,
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
    color: "#00BFA6",
    fontWeight: "600" as const,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginTop: 4,
  },
  servicesSection: {
    marginTop: 8,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1E1E1E",
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    backgroundColor: "#E8F5F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#00BFA6",
  },
  inactiveWarning: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  inactiveText: {
    fontSize: 13,
    color: "#F57C00",
    textAlign: "center",
  },
});
