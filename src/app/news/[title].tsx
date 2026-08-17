import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ContentState, PublicScreen, RemoteImage } from '@/components/public-ui';
import { NewsItem } from '@/services/public-content';

function parseNewsItem(value: string | string[] | undefined): NewsItem | null {
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value) as NewsItem;
  } catch {
    return null;
  }
}

export default function NewsDetailScreen() {
  const { item } = useLocalSearchParams<{ item?: string }>();
  const newsItem = parseNewsItem(item);

  if (!newsItem) {
    return <PublicScreen title="Noticia"><ContentState title="Noticia no disponible" description="Regrese al listado para seleccionar una publicación." /></PublicScreen>;
  }

  return (
    <PublicScreen title="Noticia">
      <RemoteImage source={newsItem.image} style={styles.image} />
      <View style={styles.article}>
        <Text style={styles.source}>{newsItem.source}</Text>
        <Text style={styles.title}>{newsItem.title}</Text>
        <Text style={styles.date}>{new Date(newsItem.date).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        <Text style={styles.summary}>{newsItem.summary}</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(newsItem.url)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Abrir fuente original</Text>
        </Pressable>
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 260, borderRadius: 8 },
  article: { padding: 20, gap: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE5F0', backgroundColor: '#FFFFFF' },
  source: { color: '#0E7490', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: '#102A43', fontSize: 25, lineHeight: 32, fontWeight: '800' },
  date: { color: '#637A8A', fontSize: 13 },
  summary: { color: '#334E68', fontSize: 16, lineHeight: 25 },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, borderRadius: 6, marginTop: 8, backgroundColor: '#075985' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.74 },
});