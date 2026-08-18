import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function OffersMapWebFallback() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mapa disponible en Android</Text>
        <Text style={styles.message}>
          Abre la aplicación en un dispositivo Android para consultar las ofertas en el mapa.
        </Text>
        <Pressable onPress={() => router.replace('/ofertas')} style={styles.button}>
          <Text style={styles.buttonText}>Volver a ofertas</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#102a43',
    fontSize: 18,
    fontWeight: '800',
  },
  message: {
    color: '#526b7a',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
