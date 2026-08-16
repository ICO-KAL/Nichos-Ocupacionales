import { api } from '@/backend/api';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Application } from '../../types/offers';

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/me/applications');
      if (response.data?.ok) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar mis aplicaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  // Mapeo de estados a textos y colores descriptivos
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'winner':
        return (
          <View className="bg-emerald-100 px-3 py-1 rounded-full">
            <Text className="text-emerald-700 font-bold text-xs">🎉 Ganador</Text>
          </View>
        );
      case 'finalist':
        return (
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-purple-700 font-bold text-xs">⭐ Finalista</Text>
          </View>
        );
      case 'rejected':
        return (
          <View className="bg-red-100 px-3 py-1 rounded-full">
            <Text className="text-red-700 font-bold text-xs">Descartado</Text>
          </View>
        );
      case 'applied':
      default:
        return (
          <View className="bg-amber-100 px-3 py-1 rounded-full">
            <Text className="text-amber-800 font-bold text-xs">En revisión</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-500">Cargando tus postulaciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Mis Aplicaciones</Text>
        <Text className="text-gray-500">Seguimiento de tus postulaciones</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-16">
            <Text className="text-gray-400 text-base mb-2">Aún no has aplicado a ninguna oferta</Text>
            <Text className="text-gray-400 text-xs">Tus postulaciones aparecerán aquí</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/ofertas/${item.offer.id}`)}
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: item.offer.photo }}
                className="w-14 h-14 rounded-xl bg-gray-200 mr-3"
                contentFit="cover"
              />
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
                  {item.offer.jobTypeName}
                </Text>
                <Text className="text-emerald-600 font-semibold text-xs mt-0.5">
                  {item.offer.payment.currency} ${item.offer.payment.amount} / {item.offer.payment.period}
                </Text>
              </View>
              {renderStatusBadge(item.status)}
            </View>

            {item.comment ? (
              <View className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-2">
                <Text className="text-xs text-gray-600 italic" numberOfLines={2}>
                  "{item.comment}"
                </Text>
              </View>
            ) : null}

            <Text className="text-gray-400 text-[10px] text-right mt-1">
              Postulado el: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}