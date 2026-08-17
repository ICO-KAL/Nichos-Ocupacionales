import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps'; // Ensure this package is installed: npm install react-native-maps
import { useOffersStore } from '../../store/userOffersStore';

export default function OffersMapScreen() {
  const router = useRouter();
  const { offers, fetchOffers, isLoading } = useOffersStore();

  useEffect(() => {
    if (offers.length === 0) {
      fetchOffers();
    }
  }, []);

  // Coordenadas por defecto (Centro de Santo Domingo si no hay data)
  const initialRegion = {
    latitude: offers.length > 0 ? offers[0].location.lat : 18.4861,
    longitude: offers.length > 0 ? offers[0].location.lng : -69.9312,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {offers.map((offer) => {
          // Validamos que tenga coordenadas válidas
          if (!offer.location?.lat || !offer.location?.lng) return null;

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
          📍 {offers.length} ofertas encontradas en el mapa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mapBadgeText: {
    color: '#1f2937',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
  },
});