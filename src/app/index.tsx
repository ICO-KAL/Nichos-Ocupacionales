import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PublicScreen } from '@/components/public-ui';

const screenWidth = Dimensions.get('window').width;

const slides = [
  {
    title: 'Tu próximo paso profesional empieza hoy.',
    message:
      'Encuentra información, herramientas y oportunidades para seguir creciendo.',
    image:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Información que te mantiene al día.',
    message:
      'Consulta noticias relevantes para el mundo laboral desde una sola aplicación.',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Aprende a destacar.',
    message:
      'Accede a videos prácticos para preparar tu búsqueda de empleo.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
  },
];

export default function IndexScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slider = useRef<FlatList<(typeof slides)[number]>>(null);

  return (
    <PublicScreen>
      <View style={styles.welcome}>
        <Text style={styles.eyebrow}>PLATAFORMA DE CRECIMIENTO</Text>
        <Text style={styles.title}>INNOVATECH SOLUTIONS</Text>
        <Text style={styles.subtitle}>
          Recursos claros para impulsar tu futuro profesional.
        </Text>
      </View>
      <FlatList
        data={slides}
        horizontal
        keyExtractor={(item) => item.title}
        onMomentumScrollEnd={(event) =>
          setActiveSlide(
            Math.round(event.nativeEvent.contentOffset.x / screenWidth),
          )
        }
        pagingEnabled
        ref={slider}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: screenWidth - 40 }]}>
            <Image contentFit="cover" source={{ uri: item.image }} style={styles.slideImage} />
            <View style={styles.slideShade} />
            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideMessage}>{item.message}</Text>
            </View>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <View style={styles.dots}>
        {slides.map((slide, index) => (
          <View
            key={slide.title}
            style={[styles.dot, index === activeSlide && styles.activeDot]}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/news' as never)}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
          <Text style={styles.primaryActionText}>Explorar noticias</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/videos' as never)}
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
          <Text style={styles.secondaryActionText}>Ver videos</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/login' as never)}
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
          <Text style={styles.secondaryActionText}>Entrar</Text>
        </Pressable>
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: 8, marginBottom: 4 },
  eyebrow: {
    color: '#0E7490',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: { color: '#102A43', fontSize: 31, lineHeight: 38, fontWeight: '900' },
  subtitle: { color: '#526B7A', fontSize: 16, lineHeight: 24 },
  slide: {
    height: 330,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 8,
    backgroundColor: '#0F4264',
  },
  slideImage: { ...StyleSheet.absoluteFill },
  slideShade: { ...StyleSheet.absoluteFill, backgroundColor: '#06263DC4' },
  slideContent: { flex: 1, justifyContent: 'flex-end', padding: 24, gap: 10 },
  slideTitle: { color: '#FFFFFF', fontSize: 25, lineHeight: 32, fontWeight: '800' },
  slideMessage: { color: '#E9F5FF', fontSize: 16, lineHeight: 23 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: -7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#B8C9D7' },
  activeDot: { width: 23, backgroundColor: '#075985' },
  actions: { gap: 10, marginTop: 14 },
  primaryAction: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#075985',
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryAction: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#075985',
    backgroundColor: '#FFFFFF',
  },
  secondaryActionText: { color: '#075985', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
