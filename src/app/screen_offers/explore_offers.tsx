import { JobTypeFilter } from '@/components/ui/JobTypeFilter';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OfferCard } from '../../components/ui/OfferCard';
import { useOffersStore } from '../../store/userOffersStore';

export default function ExploreOffersScreen() {
  const { offers, isLoading, error, fetchOffers } = useOffersStore();

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (isLoading && offers.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Buscando oportunidades...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar Ofertas</Text>
        <Text style={styles.subtitle}>Encuentra tu próximo trabajo temporal</Text>
      </View>
  

      {/* Aquí irá el componente de Filtros Dinámicos más adelante */}
      <JobTypeFilter/>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfferCard offer={item} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => fetchOffers()}
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
    marginBottom: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
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