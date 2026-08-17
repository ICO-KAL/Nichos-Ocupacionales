import { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function AuthScreen({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandRow}>
            <View style={styles.mark}>
              <Text style={styles.markText}>$</Text>
            </View>
            <Text style={styles.brand}>PRESUPUESTO</Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.form}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoComplete?:
    | "email"
    | "name"
    | "given-name"
    | "family-name"
    | "password"
    | "new-password"
    | "one-time-code"
    | "off";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete={autoComplete}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#718096"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        textContentType={secureTextEntry ? "password" : undefined}
        value={value}
      />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  isLoading = false,
}: {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}) {
  return (
    <Pressable
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (pressed || isLoading) && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function TextAction({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Text style={styles.textAction}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E7490",
  },
  markText: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  brand: {
    color: "#17324D",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  heading: { marginTop: 58, marginBottom: 32 },
  eyebrow: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: { color: "#102A43", fontSize: 32, lineHeight: 38, fontWeight: "800" },
  description: {
    color: "#526B7A",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  form: { gap: 18 },
  field: { gap: 8 },
  label: { color: "#243B53", fontSize: 14, fontWeight: "700" },
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C9D6DF",
    backgroundColor: "#FFFFFF",
    color: "#102A43",
    fontSize: 16,
  },
  primaryButton: {
    height: 52,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#0E7490",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.72 },
  error: {
    padding: 12,
    borderRadius: 6,
    color: "#9B1C1C",
    backgroundColor: "#FDE8E8",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: { marginTop: 28, alignItems: "center", gap: 14 },
  textAction: {
    color: "#0E7490",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
