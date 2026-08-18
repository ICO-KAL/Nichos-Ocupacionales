import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps'; // Ensure this package is installed: npm install react-native-maps
import { useOffersStore } from '../../store/userOffersStore';

export default function OffersMapScreen() {
  const router = useRouter();
  const { offers, fetchOffers, isLoading } = useOffersStore();

  useEffect(() => {
    if (offers.length === 0) {
      void fetchOffers();
    }
  }, [fetchOffers, offers.length]);

  const offersWithLocation = offers.filter(
    (offer) =>
      Number.isFinite(offer.location?.lat) &&
      Number.isFinite(offer.location?.lng),
  );
  const initialRegion = {
    latitude: offersWithLocation[0]?.location.lat ?? 18.4861,
    longitude: offersWithLocation[0]?.location.lng ?? -69.9312,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  if (isLoading && offers.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {offersWithLocation.map((offer) => {
          return (
            <Marker
              key={offer.id}
              coordinate={{
                latitude: offer.location.lat,
                longitude: offer.location.lng,
              }}
              title={offer.jobTypeName}
              description={`${offer.payment.currency} $${offer.payment.amount} / ${offer.payment.period}`}
            >
              {/* Callout personalizado para mostrar la tarjeta flotante al tocar un pin */}
              <Callout
                tooltip
                onPress={() => router.push(`/ofertas/${offer.id}`)}
              >
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {offer.jobTypeName}
                  </Text>
                  <Text style={styles.calloutDescription} numberOfLines={2}>
                    {offer.description}
                  </Text>
                  <Text style={styles.calloutPrice}>
                    {offer.payment.currency} ${offer.payment.amount}{' '}
                    <Text style={styles.calloutPeriod}>/ {offer.payment.period}</Text>
                  </Text>
                  <Text style={styles.calloutLink}>Ver detalle →</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Indicador flotante sobre el mapa */}
      <View style={styles.mapBadge}>
        <Text style={styles.mapBadgeText}>
          📍 {offersWithLocation.length} ofertas con ubicación
        </Text>
      </View>
      {offersWithLocation.length === 0 ? (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyTitle}>No hay ubicaciones disponibles</Text>
          <Text style={styles.emptyText}>
            Las ofertas publicadas sin coordenadas no pueden mostrarse en el mapa.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver a ofertas</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#4b5563',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    width: 208,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
  },
  calloutTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  calloutDescription: {
    color: '#6b7280',
    fontSize: 11,
    marginVertical: 4,
    lineHeight: 16,
  },
  calloutPrice: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  calloutPeriod: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  calloutLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
  mapBadge: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
  },
  mapBadgeText: {
    color: '#1f2937',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
  },
  emptyOverlay: {
    position: 'absolute',
    top: '40%',
    left: 24,
    right: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  backButton: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});