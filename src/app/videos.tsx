import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ContentState, PublicScreen, RemoteImage, RetryButton } from '@/components/public-ui';
import { getVideos, Video } from '@/services/public-content';

export default function VideosScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadVideos() {
    setIsLoading(true);
    setError(null);
    try {
      setVideos(await getVideos());
    } catch {
      setError('No pudimos cargar los videos. Revise su conexion e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <PublicScreen title="Videos para avanzar">
      <Text style={styles.intro}>Consejos prácticos para tu búsqueda laboral y desarrollo profesional.</Text>
      {isLoading ? <ContentState title="Cargando videos" description="Estamos preparando los recursos disponibles." action={<ActivityIndicator color="#075985" />} /> : null}
      {error ? <ContentState title="No fue posible cargar los videos" description={error} action={<RetryButton onPress={loadVideos} />} /> : null}
      {!isLoading && !error && videos.length === 0 ? <ContentState title="Aún no hay videos" description="Vuelva a consultar más tarde para ver nuevos recursos." action={<RetryButton onPress={loadVideos} />} /> : null}
      {!isLoading && !error ? videos.sort((first, second) => first.order - second.order).map((video) => (
        <View key={video.id} style={styles.card}>
          <RemoteImage source={video.thumbnail} style={styles.thumbnail} />
          <View style={styles.overlay}><Text style={styles.playIcon}>▶</Text></View>
          <View style={styles.content}>
            <Text style={styles.title}>{video.title}</Text>
            <Text numberOfLines={3} style={styles.description}>{video.description}</Text>
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(video.url)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>Ver en YouTube</Text>
            </Pressable>
          </View>
        </View>
      )) : null}
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: '#526B7A', fontSize: 15, lineHeight: 22, marginBottom: 4 },
  card: { overflow: 'hidden', position: 'relative', borderRadius: 8, borderWidth: 1, borderColor: '#DCE5F0', backgroundColor: '#FFFFFF' },
  thumbnail: { width: '100%', height: 194 },
  overlay: { position: 'absolute', top: 72, alignSelf: 'center', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: '#075985E8' },
  playIcon: { color: '#FFFFFF', fontSize: 20, marginLeft: 3 },
  content: { padding: 16, gap: 9 },
  title: { color: '#102A43', fontSize: 18, lineHeight: 24, fontWeight: '800' },
  description: { color: '#526B7A', fontSize: 14, lineHeight: 20 },
  button: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 6, marginTop: 2, backgroundColor: '#E1F1FA' },
  buttonText: { color: '#075985', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});