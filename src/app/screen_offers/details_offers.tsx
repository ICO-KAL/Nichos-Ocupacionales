import { api } from '@/backend/api';
import type { Offer } from '@/types/offers';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { useStyles } from 'nativewind';


export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados del formulario
  const [comment, setComment] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchOfferDetail();
  }, [id]);

  const fetchOfferDetail = async () => {
    try {
      const response = await api.get(`/offers/${id}`);
      if (response.data?.ok) {
        setOffer(response.data.data);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar el detalle de la oferta.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleApply = async () => {
    if (!offer) return;

    // Validar preguntas obligatorias
    for (const q of offer.questions) {
      if (q.required && !answers[q.id]) {
        Alert.alert('Campo requerido', `Por favor responde: "${q.label}"`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        comment,
        answers,
      };

      const res = await api.post(`/offers/${id}/apply`, payload);
      if (res.data?.ok) {
        Alert.alert('¡Postulación enviada!', 'Tu aplicación fue registrada con éxito.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert(
        'Error al aplicar',
        err.response?.data?.message || 'No se pudo procesar la postulación.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <Text className="text-gray-500">Oferta no encontrada.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Imagen principal */}
        <Image source={{ uri: offer.photo }} className="w-full h-56 bg-gray-200" contentFit="cover" />

        <View className="p-5">
          {/* Encabezado */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-gray-900 flex-1 mr-2">{offer.jobTypeName}</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-bold text-xs uppercase">{offer.contractType}</Text>
            </View>
          </View>

          <Text className="text-emerald-600 font-extrabold text-xl mb-4">
            {offer.payment.currency} ${offer.payment.amount}{' '}
            <Text className="text-sm text-gray-500 font-normal">/ {offer.payment.period}</Text>
          </Text>

          {/* Regla de Privacidad: Publicador Anónimo */}
          <View className="bg-gray-100 p-3 rounded-xl mb-4 border border-gray-200">
            <Text className="text-xs text-gray-600">
              🔒 <Text className="font-semibold">Publicador Oculto:</Text>{' '}
              {offer.isIdentityRevealed
                ? 'Identidad revelada (¡Eres el ganador!)'
                : 'La identidad de quien publica se revelará únicamente si eres seleccionado como ganador.'}
            </Text>
          </View>

          {/* Ubicación y Descripción */}
          <Text className="text-gray-700 text-sm mb-1 font-semibold">📍 Ubicación:</Text>
          <Text className="text-gray-500 text-sm mb-4">{offer.address}</Text>

          <Text className="text-gray-700 text-sm mb-1 font-semibold">📝 Descripción:</Text>
          <Text className="text-gray-600 text-sm mb-6 leading-relaxed">{offer.description}</Text>

          {/* Formulario de Postulación */}
          <View className="border-t border-gray-200 pt-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">Formulario de Postulación</Text>

            {/* Comentario general */}
            <Text className="text-sm font-medium text-gray-700 mb-2">Comentario de aplicación</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Escribe un breve mensaje para el empleador..."
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-xl p-3 text-sm mb-4 text-gray-800 bg-gray-50"
              textAlignVertical="top"
            />

            {/* Renderizado Dinámico de Preguntas Adicionales */}
            {offer.questions.map((q) => (
              <View key={q.id} className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {q.label} {q.required && <Text className="text-red-500">*</Text>}
                </Text>

                {/* Pregunta tipo SELECT */}
                {q.type === 'select' && q.options && (
                  <View className="gap-2">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => handleAnswerChange(q.id, opt)}
                          className={`p-3 rounded-xl border ${
                            isSelected ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Text className={isSelected ? 'text-blue-600 font-bold' : 'text-gray-700'}>
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {/* Pregunta tipo TEXT */}
                {q.type === 'text' && (
                  <TextInput
                    value={answers[q.id] || ''}
                    onChangeText={(val) => handleAnswerChange(q.id, val)}
                    placeholder="Tu respuesta..."
                    className="border border-gray-300 rounded-xl p-3 text-sm text-gray-800 bg-gray-50"
                  />
                )}
              </View>
            ))}

            {/* Botón de Aplicar */}
            <Pressable
              onPress={handleApply}
              disabled={submitting}
              className={`py-4 rounded-xl items-center mt-4 ${
                submitting ? 'bg-gray-400' : 'bg-blue-600'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Enviar Postulación</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}