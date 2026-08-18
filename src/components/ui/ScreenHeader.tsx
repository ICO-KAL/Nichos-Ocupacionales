import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, rightSlot }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            onPress={onBack}
            android_ripple={{ color: '#cffafe', borderless: true }}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>← Volver</Text>
          </Pressable>
          {rightSlot ? <View>{rightSlot}</View> : <View />}
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#F4F7F8",
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
  },
  backText: {
    color: "#0E7490",
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    marginTop: 8,
    color: "#102A43",
    fontSize: 28,
    fontWeight: "800",
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 2,
    color: "#627D98",
    fontSize: 14,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.7,
  },
});
