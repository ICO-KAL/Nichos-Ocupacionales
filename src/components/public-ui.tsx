import { Href, router } from 'expo-router';
import { Image } from 'expo-image';
import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const navigation: Array<{ label: string; href: Href }> = [
  { label: 'Inicio', href: '/' },
  { label: 'Noticias', href: '/news' as Href },
  { label: 'Videos', href: '/videos' as Href },
  { label: 'Equipo', href: '/about' as Href },
];

export function PublicScreen({ children, title, action }: PropsWithChildren<{ title?: string; action?: ReactNode }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/')} style={styles.brand}>
          <View style={styles.mark}>
            <Text style={styles.markText}>I</Text>
          </View>
          <View>
            <Text style={styles.brandName}>INNOVATECH</Text>
            <Text style={styles.brandSubname}>SOLUTIONS</Text>
          </View>
        </Pressable>
        {action}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
        {children}
      </ScrollView>
      <View style={styles.navigation}>
        {navigation.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.label}
            onPress={() => router.navigate(item.href)}
            style={({ pressed }) => [styles.navigationItem, pressed && styles.pressed]}>
            <Text style={styles.navigationLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export function ContentState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.state}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {action ? <View style={styles.stateAction}>{action}</View> : null}
    </View>
  );
}

export function RetryButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
      <Text style={styles.retryText}>Reintentar</Text>
    </Pressable>
  );
}

export function RemoteImage({ source, style }: { source?: string; style: object }) {
  return source ? <Image contentFit="cover" source={{ uri: source }} style={style} transition={180} /> : <View style={[style, styles.imageFallback]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F8FC' },
  header: { minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#DCE5F0' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: '#075985' },
  markText: { color: '#FFFFFF', fontWeight: '900', fontSize: 19 },
  brandName: { color: '#102A43', fontSize: 13, fontWeight: '900', letterSpacing: 1.1 },
  brandSubname: { color: '#0E7490', fontSize: 10, fontWeight: '800', letterSpacing: 1.9, marginTop: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 96, gap: 18 },
  screenTitle: { color: '#102A43', fontSize: 30, lineHeight: 37, fontWeight: '800', marginBottom: 2 },
  navigation: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 62, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', borderTopColor: '#DCE5F0', borderTopWidth: 1 },
  navigationItem: { paddingHorizontal: 8, paddingVertical: 11, alignItems: 'center' },
  navigationLabel: { color: '#174A6E', fontSize: 12, fontWeight: '700' },
  state: { minHeight: 230, padding: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE5F0' },
  stateTitle: { color: '#17324D', fontSize: 19, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  stateDescription: { color: '#526B7A', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, maxWidth: 360 },
  stateAction: { marginTop: 18 },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 6, backgroundColor: '#075985' },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  imageFallback: { backgroundColor: '#DCE8F3' },
  pressed: { opacity: 0.72 },
});