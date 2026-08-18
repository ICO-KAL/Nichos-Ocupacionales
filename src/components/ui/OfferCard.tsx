import type { Offer } from '@/types/offers';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrowLayout = width < 360;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(`/ofertas/${offer.id}`)}
      android_ripple={{ color: '#dbeafe' }}
      accessibilityRole="button"
      accessibilityLabel={`Ver oferta: ${offer.jobTypeName}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {offer.photo && !imageFailed ? (
        <Image
          source={{ uri: offer.photo }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackTitle}>Oferta de trabajo</Text>
          <Text style={styles.imageFallbackText}>Imagen no disponible</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {offer.jobTypeName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {offer.contractType}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {offer.description}
        </Text>

        <View style={[styles.footerRow, isNarrowLayout && styles.footerColumn]}>
          <Text style={styles.address} numberOfLines={1}>
            📍 {offer.address}
          </Text>
          <Text style={[styles.paymentText, isNarrowLayout && styles.paymentTextNarrow]}>
            {offer.payment.currency} ${offer.payment.amount}{' '}
            <Text style={styles.periodText}>/ {offer.payment.period}</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  cardPressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e5e7eb',
  },
  imageFallback: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbe3ee',
  },
  imageFallbackTitle: {
    color: '#102a43',
    fontSize: 16,
    fontWeight: '800',
  },
  imageFallbackText: {
    color: '#526b7a',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  footerColumn: {
    alignItems: 'flex-start',
  },
  address: {
    color: '#4b5563',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  paymentText: {
    color: '#059669',
    fontWeight: '700',
  },
  paymentTextNarrow: {
    marginTop: 6,
  },
  periodText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '400',
  },
});