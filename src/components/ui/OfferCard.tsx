import type { Offer } from '@/types/offers';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/ofertas/${offer.id}`)}
      style={styles.card}
    >
      <Image
        source={{ uri: offer.photo }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
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

        <View style={styles.footerRow}>
          <Text style={styles.address} numberOfLines={1}>
            📍 {offer.address}
          </Text>
          <Text style={styles.paymentText}>
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
    boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.05)',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e5e7eb',
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
  periodText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '400',
  },
});