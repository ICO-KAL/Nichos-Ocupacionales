import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { JobType, useAuth } from "@/auth/auth-context";
import {
  AuthScreen,
  ErrorMessage,
  FormField,
  PrimaryButton,
} from "@/components/auth-ui";

export default function AddExperienceScreen() {
  const { addExperience, uploadImage, getJobTypes } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobTypeKey, setJobTypeKey] = useState("");
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getJobTypes()
      .then(setJobTypes)
      .catch(() => setJobTypes([]));
  }, [getJobTypes]);

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  }

  async function handleSave() {
    setError(null);
    if (!title.trim() || !description.trim() || !jobTypeKey.trim()) {
      setError("Complete el titulo, la descripcion y el tipo de trabajo.");
      return;
    }

    setIsLoading(true);
    try {
      let certificateImage: string | undefined;
      if (imageBase64) {
        const uploadResult = await uploadImage(
          `data:image/jpeg;base64,${imageBase64}`,
          `certificado-${Date.now()}.jpg`,
        );
        certificateImage = uploadResult.url;
      }

      await addExperience({
        title: title.trim(),
        description: description.trim(),
        jobTypeKey: jobTypeKey.trim(),
        certificateImage,
      });
      router.back();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar la experiencia.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Agregue una experiencia laboral y, si desea, un certificado como imagen."
      eyebrow="EXPERIENCIAS"
      title="Nueva experiencia"
    >
      <FormField
        label="Titulo"
        onChangeText={setTitle}
        placeholder="Ej. Ingeniero"
        value={title}
      />
      <FormField
        label="Descripcion"
        onChangeText={setDescription}
        placeholder="Describa la experiencia"
        value={description}
      />
      <FormField
        label="Tipo de trabajo (clave)"
        onChangeText={setJobTypeKey}
        placeholder="Ej. Ingeniero"
        value={jobTypeKey}
      />

      {jobTypes.length > 0 && (
        <View style={styles.jobTypeList}>
          {jobTypes.map((jobType) => (
            <Pressable
              key={jobType.key}
              onPress={() => setJobTypeKey(jobType.key)}
              style={styles.jobTypeChip}
            >
              <Text style={styles.jobTypeChipText}>{jobType.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable onPress={handlePickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>
            Seleccionar certificado (imagen)
          </Text>
        )}
      </Pressable>

      <ErrorMessage message={error} />
      <PrimaryButton
        isLoading={isLoading}
        onPress={handleSave}
        title="Guardar experiencia"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  jobTypeList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  jobTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  jobTypeChipText: { color: "#243B53", fontSize: 13, fontWeight: "600" },
  imagePicker: {
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C9D6DF",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  imagePickerText: { color: "#526B7A", fontWeight: "600" },
  imagePreview: { width: "100%", height: "100%", borderRadius: 8 },
});
