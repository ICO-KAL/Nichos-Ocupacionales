import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function OffersMapWebScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/ofertas');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Mapa de ofertas" onBack={handleBack} />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>El mapa está disponible en la app Android</Text>
          <Text style={styles.description}>
            Abre Ocupa2 en tu dispositivo Android para ver las ofertas con ubicación en el mapa y
            seleccionar un marcador.
          </Text>
          <Pressable onPress={handleBack} style={styles.button}>
            <Text style={styles.buttonText}>Volver a explorar ofertas</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
