import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ContentState, PublicScreen, RemoteImage, RetryButton } from '@/components/public-ui';
import { getNews, NewsItem } from '@/services/public-content';

function formatDate(date: string) {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNews() {
    setIsLoading(true);
    setError(null);
    try {
      setNews(await getNews());
    } catch {
      setError('No pudimos cargar las noticias. Revise su conexion e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <PublicScreen title="Noticias de empleo">
      <Text style={styles.intro}>Actualidad y oportunidades seleccionadas desde fuentes públicas.</Text>
      {isLoading ? <ContentState title="Cargando noticias" description="Estamos consultando las publicaciones más recientes." action={<ActivityIndicator color="#075985" />} /> : null}
      {error ? <ContentState title="No fue posible cargar las noticias" description={error} action={<RetryButton onPress={loadNews} />} /> : null}
      {!isLoading && !error && news.length === 0 ? <ContentState title="Aún no hay noticias" description="Vuelva a consultar más tarde para ver nuevas publicaciones." action={<RetryButton onPress={loadNews} />} /> : null}
      {!isLoading && !error ? news.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={`${item.title}-${item.url}`}
          onPress={() => router.push({ pathname: '/news/[title]' as never, params: { title: item.title, item: JSON.stringify(item) } })}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <RemoteImage source={item.image} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.meta}>{[item.source, formatDate(item.date)].filter(Boolean).join('  |  ')}</Text>
            <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
            <Text numberOfLines={3} style={styles.summary}>{item.summary}</Text>
            <Text style={styles.readMore}>Leer noticia</Text>
          </View>
        </Pressable>
      )) : null}
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: '#526B7A', fontSize: 15, lineHeight: 22, marginBottom: 4 },
  card: { overflow: 'hidden', flexDirection: 'row', minHeight: 144, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE5F0' },
  image: { width: 122, minHeight: 144 },
  cardContent: { flex: 1, padding: 14, gap: 6 },
  meta: { color: '#0E7490', fontSize: 11, fontWeight: '700' },
  title: { color: '#102A43', fontSize: 16, lineHeight: 21, fontWeight: '800' },
  summary: { color: '#526B7A', fontSize: 13, lineHeight: 18 },
  readMore: { color: '#075985', fontSize: 13, fontWeight: '800', marginTop: 'auto' },
  pressed: { opacity: 0.74 },
});