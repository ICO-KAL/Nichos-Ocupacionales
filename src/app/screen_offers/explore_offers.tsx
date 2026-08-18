import { JobTypeFilter } from '@/components/ui/JobTypeFilter';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OfferCard } from '../../components/ui/OfferCard';
import { useOffersStore } from '../../store/userOffersStore';

export default function ExploreOffersScreen() {
  const router = useRouter();
  const { offers, isLoading, error, fetchOffers } = useOffersStore();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  };

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (isLoading && offers.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Explorar ofertas" onBack={handleBack} />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Buscando oportunidades...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Explorar ofertas" onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>No pudimos cargar las ofertas</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetchOffers()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.offerItem}>
            <OfferCard offer={item} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => fetchOffers()}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <ScreenHeader
              title="Explorar ofertas"
              subtitle="Encuentra tu próximo trabajo temporal"
              onBack={handleBack}
            />
            <View style={styles.controlsRow}>
              <View style={styles.filterWrap}>
                <JobTypeFilter />
              </View>
              <Pressable
                onPress={() => router.push('/ofertas/mapa')}
                style={styles.mapButton}
                accessibilityRole="button"
                accessibilityLabel="Ver ofertas en el mapa"
              >
                <Text style={styles.mapButtonText}>Ver mapa</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay ofertas disponibles en este momento.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    marginBottom: 8,
  },
  filterWrap: {
    flex: 1,
  },
  mapButton: {
    minHeight: 40,
    marginRight: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  mapButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '700',
  },
  offerItem: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
  },
});