import { api, mensajeDeError } from '@/lib/api/client';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { mostrarToast } from '@/components/toast';
import { confirmarAccion } from '@/components/confirmation-dialog';
import type { Offer } from '@/types/offers';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AnswerValue = string | boolean;

function questionKey(question: NonNullable<Offer['questions']>[number], index: number) {
  return question.id ?? `question-${index}`;
}

function isAnswerMissing(value: AnswerValue | undefined) {
  return value === undefined || value === '';
}

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/ofertas');
  };

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);

  // Estados del formulario
  const [comment, setComment] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const fetchOfferDetail = useCallback(async () => {
    try {
      const response = await api.get<Offer>(`/offers/${id}`);
      const data = response.data?.data;
      if (response.data?.ok && data) {
        setOffer({
          ...data,
          questions: Array.isArray(data.questions) ? data.questions : [],
        });
      }
    } catch {
      mostrarToast('Error', 'No se pudo cargar el detalle de la oferta.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOfferDetail();
  }, [fetchOfferDetail]);

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleApply = async () => {
    if (!offer) return;

    // Validar preguntas obligatorias
    const questions = offer.questions ?? [];
    for (const [index, q] of questions.entries()) {
      const key = questionKey(q, index);
      if (q.required && isAnswerMissing(answers[key])) {
        mostrarToast('Campo requerido', `Por favor responde: "${q.label}"`, 'warning');
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
        mostrarToast('Postulación enviada', 'Tu aplicación fue registrada correctamente.');
        router.back();
      }
    } catch (err) {
      mostrarToast('Error al aplicar', mensajeDeError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.centered}>
        <Text style={styles.mutedText}>Oferta no encontrada.</Text>
      </View>
    );
  }

  const questions = offer.questions ?? [];
  const isCompactLayout = width < 360;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader title="Detalle de oferta" onBack={handleBack} />
          <View style={styles.content}>
            {offer.photo && !photoUnavailable ? (
              <Image
                source={{ uri: offer.photo }}
                style={[styles.image, { height: isCompactLayout ? 180 : 224 }]}
                contentFit="cover"
                onError={() => setPhotoUnavailable(true)}
              />
            ) : (
              <View style={[styles.imageFallback, { height: isCompactLayout ? 180 : 224 }]}>
                <Text style={styles.imageFallbackTitle}>Oferta de trabajo</Text>
                <Text style={styles.imageFallbackText}>La imagen no está disponible</Text>
              </View>
            )}

            <View style={styles.details}>
              <Text style={styles.title}>{offer.jobTypeName}</Text>
              <View style={styles.contractChip}>
                <Text style={styles.contractChipText}>{offer.contractType}</Text>
              </View>

              <Text style={styles.payment}>
                {offer.payment.currency} ${offer.payment.amount}{' '}
                <Text style={styles.paymentPeriod}>/ {offer.payment.period}</Text>
              </Text>

              <View style={styles.privacyCard}>
                <Text style={styles.privacyText}>
                  🔒 <Text style={styles.privacyLabel}>Publicador Oculto:</Text>{' '}
                  {offer.isIdentityRevealed
                    ? 'Identidad revelada (¡Eres el ganador!)'
                    : 'La identidad de quien publica se revelará únicamente si eres seleccionado como ganador.'}
                </Text>
              </View>

              <Text style={styles.sectionLabel}>📍 Ubicación</Text>
              <Text style={styles.sectionValue}>{offer.address}</Text>

              <Text style={styles.sectionLabel}>📝 Descripción</Text>
              <Text style={styles.description}>{offer.description}</Text>

              <View style={styles.applicationForm}>
                <Text style={styles.formTitle}>Formulario de postulación</Text>

                <Text style={styles.inputLabel}>Comentario de aplicación</Text>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Escribe un breve mensaje para el empleador..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#6b7280"
                  style={[styles.input, styles.commentInput]}
                />

                {questions.map((q, index) => {
                  const key = questionKey(q, index);
                  const value = answers[key];
                  return (
                    <View key={key} style={styles.question}>
                      <Text style={styles.inputLabel}>
                        {q.label} {q.required && <Text style={styles.required}>*</Text>}
                      </Text>

                      {q.type === 'select' && (
                        <View style={styles.optionList}>
                          {(q.options ?? []).map((opt) => {
                            const isSelected = value === opt;
                            return (
                              <Pressable
                                key={opt}
                                onPress={() => handleAnswerChange(key, opt)}
                                style={[styles.option, isSelected && styles.optionSelected]}
                              >
                                <Text style={isSelected ? styles.optionTextSelected : styles.optionText}>
                                  {opt}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}

                      {(q.type === 'text' || q.type === 'date') && (
                        <TextInput
                          value={typeof value === 'string' ? value : ''}
                          onChangeText={(answer) => handleAnswerChange(key, answer)}
                          placeholder={q.type === 'date' ? 'AAAA-MM-DD' : 'Tu respuesta...'}
                          accessibilityLabel={q.label}
                          placeholderTextColor="#6b7280"
                          style={styles.input}
                        />
                      )}

                      {q.type === 'check' && (
                        <View style={styles.booleanChoices}>
                          {[true, false].map((option) => {
                            const isSelected = value === option;
                            return (
                              <Pressable
                                key={String(option)}
                                onPress={() => handleAnswerChange(key, option)}
                                style={[styles.booleanChoice, isSelected && styles.booleanChoiceSelected]}
                              >
                                <Text style={isSelected ? styles.booleanChoiceTextSelected : styles.booleanChoiceText}>
                                  {option ? 'Sí' : 'No'}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}

                <Pressable
                  onPress={() => confirmarAccion({
                    title: 'Enviar postulación',
                    message: '¿Deseas guardar y enviar tu postulación?',
                    confirmText: 'Guardar datos',
                    onConfirm: () => void handleApply(),
                  })}
                  disabled={submitting}
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  accessibilityRole="button"
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Enviar postulación</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f8',
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4f7f8',
  },
  mutedText: {
    color: '#526b7a',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
  imageFallback: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbe3ee',
  },
  imageFallbackTitle: {
    color: '#102a43',
    fontSize: 18,
    fontWeight: '800',
  },
  imageFallbackText: {
    color: '#526b7a',
    fontSize: 13,
    marginTop: 4,
  },
  details: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#102a43',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  contractChip: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
  },
  contractChipText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  payment: {
    color: '#059669',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 16,
  },
  paymentPeriod: {
    color: '#526b7a',
    fontSize: 14,
    fontWeight: '400',
  },
  privacyCard: {
    marginBottom: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  privacyText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  privacyLabel: {
    color: '#334e68',
    fontWeight: '800',
  },
  sectionLabel: {
    color: '#243b53',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionValue: {
    color: '#526b7a',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  description: {
    color: '#526b7a',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  applicationForm: {
    borderTopWidth: 1,
    borderTopColor: '#dbe3ee',
    paddingTop: 20,
  },
  formTitle: {
    color: '#102a43',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#334e68',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  required: {
    color: '#b91c1c',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#c4d4e3',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    color: '#102a43',
    fontSize: 15,
  },
  commentInput: {
    minHeight: 88,
    marginBottom: 16,
  },
  question: {
    marginBottom: 16,
  },
  optionList: {
    gap: 8,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    color: '#334e68',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '800',
  },
  booleanChoices: {
    flexDirection: 'row',
    gap: 8,
  },
  booleanChoice: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  booleanChoiceSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  booleanChoiceText: {
    color: '#374151',
    fontWeight: '600',
  },
  booleanChoiceTextSelected: {
    color: '#2563eb',
    fontWeight: '700',
  },
  submitButton: {
    minHeight: 52,
    marginTop: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});