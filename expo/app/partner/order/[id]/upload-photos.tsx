import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Camera, Upload, CheckCircle, X } from "lucide-react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "@/lib/trpc";

type PhotoType = "before" | "after";

interface PhotoData {
  uri: string;
  type: PhotoType;
  comment?: string;
}

export default function PartnerOrderPhotos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [beforePhotos, setBeforePhotos] = useState<PhotoData[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<PhotoData[]>([]);
  const [beforeComment, setBeforeComment] = useState("");
  const [afterComment, setAfterComment] = useState("");
  const [currentStep, setCurrentStep] = useState<"before" | "after">("before");

  const uploadPhoto = trpc.partners.photos.upload.useMutation({
    onSuccess: () => {
      console.log("Photo uploaded successfully");
    },
    onError: (error) => {
      Alert.alert("Ошибка", error.message);
    },
  });

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Ошибка",
        "Необходимо разрешение на использование камеры"
      );
      return false;
    }
    return true;
  };

  const takePhoto = async (type: PhotoType) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const photo: PhotoData = {
        uri: result.assets[0].uri,
        type,
      };

      if (type === "before") {
        setBeforePhotos([...beforePhotos, photo]);
      } else {
        setAfterPhotos([...afterPhotos, photo]);
      }
    }
  };

  const pickFromGallery = async (type: PhotoType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newPhotos: PhotoData[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type,
      }));

      if (type === "before") {
        setBeforePhotos([...beforePhotos, ...newPhotos]);
      } else {
        setAfterPhotos([...afterPhotos, ...newPhotos]);
      }
    }
  };

  const removePhoto = (type: PhotoType, index: number) => {
    if (type === "before") {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index));
    }
  };

  const handleNextStep = () => {
    if (currentStep === "before") {
      if (beforePhotos.length === 0) {
        Alert.alert("Ошибка", "Добавьте хотя бы одно фото до начала работы");
        return;
      }
      setCurrentStep("after");
    }
  };

  const handleSubmit = async () => {
    if (afterPhotos.length === 0) {
      Alert.alert("Ошибка", "Добавьте хотя бы одно фото после выполнения работы");
      return;
    }

    try {
      for (const photo of beforePhotos) {
        await uploadPhoto.mutateAsync({
          orderId: id,
          type: "before",
          photoUrl: photo.uri,
          comment: beforeComment || undefined,
        });
      }

      for (const photo of afterPhotos) {
        await uploadPhoto.mutateAsync({
          orderId: id,
          type: "after",
          photoUrl: photo.uri,
          comment: afterComment || undefined,
        });
      }

      Alert.alert("Успех", "Фотографии загружены", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error uploading photos:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Фотофиксация работы",
          headerBackTitle: "Назад",
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView style={styles.content}>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep === "before"
                    ? styles.stepCircleActive
                    : beforePhotos.length > 0
                    ? styles.stepCircleCompleted
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (currentStep === "before" || beforePhotos.length > 0) &&
                      styles.stepNumberActive,
                  ]}
                >
                  1
                </Text>
              </View>
              <Text style={styles.stepLabel}>Фото "До"</Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.step}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep === "after"
                    ? styles.stepCircleActive
                    : afterPhotos.length > 0
                    ? styles.stepCircleCompleted
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (currentStep === "after" || afterPhotos.length > 0) &&
                      styles.stepNumberActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text style={styles.stepLabel}>Фото "После"</Text>
            </View>
          </View>

          {currentStep === "before" ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Фото до начала работы</Text>
              <Text style={styles.sectionDescription}>
                Сфотографируйте изделие до начала работы. Это защитит вас и
                клиента.
              </Text>

              <View style={styles.photosGrid}>
                {beforePhotos.map((photo, index) => (
                  <View key={index} style={styles.photoCard}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto("before", index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addPhotoButtons}>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={() => takePhoto("before")}
                >
                  <Camera size={24} color="#00BFA6" />
                  <Text style={styles.addPhotoButtonText}>Сделать фото</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={() => pickFromGallery("before")}
                >
                  <Upload size={24} color="#00BFA6" />
                  <Text style={styles.addPhotoButtonText}>Из галереи</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Комментарий мастера (опционально)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Опишите состояние изделия..."
                value={beforeComment}
                onChangeText={setBeforeComment}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  beforePhotos.length === 0 && styles.nextButtonDisabled,
                ]}
                onPress={handleNextStep}
                disabled={beforePhotos.length === 0}
              >
                <Text style={styles.nextButtonText}>Далее</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Фото после выполнения работы</Text>
              <Text style={styles.sectionDescription}>
                Сфотографируйте результат работы. Покажите клиенту качество
                выполнения.
              </Text>

              <View style={styles.photosGrid}>
                {afterPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoCard}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto("after", index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addPhotoButtons}>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={() => takePhoto("after")}
                >
                  <Camera size={24} color="#00BFA6" />
                  <Text style={styles.addPhotoButtonText}>Сделать фото</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={() => pickFromGallery("after")}
                >
                  <Upload size={24} color="#00BFA6" />
                  <Text style={styles.addPhotoButtonText}>Из галереи</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Комментарий мастера (опционально)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Опишите выполненную работу..."
                value={afterComment}
                onChangeText={setAfterComment}
                multiline
                numberOfLines={4}
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep("before")}
                >
                  <Text style={styles.backButtonText}>Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    afterPhotos.length === 0 && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={afterPhotos.length === 0 || uploadPhoto.isPending}
                >
                  {uploadPhoto.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={20} color="#fff" />
                      <Text style={styles.submitButtonText}>Отправить</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  step: {
    alignItems: "center",
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: "#00BFA6",
  },
  stepCircleCompleted: {
    backgroundColor: "#4CAF50",
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#999",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600" as const,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  photoCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  addPhotoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00BFA6",
    borderStyle: "dashed",
    gap: 8,
  },
  addPhotoButtonText: {
    fontSize: 15,
    color: "#00BFA6",
    fontWeight: "600" as const,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlignVertical: "top",
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
