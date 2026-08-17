// src/app/ofertas/publicar.tsx
// Ruta: /ofertas/publicar
//
// Cubre los criterios de "Publicar oferta":
// - tipo de empleo y campos personalizados construidos dinámicamente desde
//   GET /job-types
// - tipo de contrato, ubicación, dirección, descripción
// - foto obligatoria (bloquea el envío si falta)
// - fecha límite
// - preguntas adicionales (text, date, select, check)
// - cobro de 1 USD por tarjeta vía POST /payments, y solo se publica
//   (POST /offers) si el pago fue aprobado

import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { mostrarAlerta } from '@/lib/alert';
import { Spacing } from '@/constants/theme';
import { obtenerTiposDeEmpleo } from '@/lib/api/catalogo';
import { mensajeDeError } from '@/lib/api/client';
import { publicarOferta } from '@/lib/api/ofertas';
import { cobrarPago } from '@/lib/api/pagos';
import type { JobType, OfferQuestionInput } from '@/lib/api/types';
import { subirImagen } from '@/lib/api/uploads';
import { ofertaSchema, type OfertaFormValues } from '@/lib/schemas/oferta-schema';

const TIPOS_CONTRATO: { value: 'temporal' | 'fijo' | 'horas'; label: string }[] = [
  { value: 'temporal', label: 'Temporal' },
  { value: 'fijo', label: 'Fijo' },
  { value: 'horas', label: 'Por horas' },
];

const TIPOS_PREGUNTA: { value: OfferQuestionInput['type']; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección' },
  { value: 'check', label: 'Sí/No' },
];

export default function PublicarOfertaScreen() {
  const router = useRouter();
  const [tiposEmpleo, setTiposEmpleo] = useState<JobType[]>([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [preguntas, setPreguntas] = useState<OfferQuestionInput[]>([]);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    obtenerTiposDeEmpleo()
      .then(setTiposEmpleo)
      .catch((e) => mostrarAlerta('Error', mensajeDeError(e)))
      .finally(() => setCargandoTipos(false));
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfertaFormValues>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      jobTypeKey: '',
      contractType: undefined,
      description: '',
      address: '',
      photoUrl: '',
      deadline: '',
      cardNumber: '',
      cvv: '',
      expMonth: '',
      expYear: '',
      cardholder: '',
    },
  });

  const jobTypeKeySeleccionado = watch('jobTypeKey');
  const tipoSeleccionado = useMemo(
    () => tiposEmpleo.find((t) => t.key === jobTypeKeySeleccionado),
    [tiposEmpleo, jobTypeKeySeleccionado]
  );

  // --- Foto (obligatoria) ---
  const subirDesde = async (origen: 'camara' | 'galeria') => {
    const permiso =
      origen === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      mostrarAlerta('Permiso necesario', 'Necesitas dar permiso para continuar.');
      return;
    }

    const resultado =
      origen === 'camara'
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });

    if (resultado.canceled) return;
    const asset = resultado.assets[0];
    if (!asset.base64) {
      mostrarAlerta('Error', 'No se pudo leer la imagen seleccionada.');
      return;
    }

    setSubiendoFoto(true);
    try {
      const dataUri = `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
      const url = await subirImagen(dataUri);
      setValue('photoUrl', url, { shouldValidate: true });
      setFotoPreview(asset.uri);
    } catch (e) {
      mostrarAlerta('Error', mensajeDeError(e));
    } finally {
      setSubiendoFoto(false);
    }
  };

  // --- Ubicación (opcional) ---
  const usarUbicacionActual = async () => {
    setBuscandoUbicacion(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        mostrarAlerta('Permiso necesario', 'Necesitas dar permiso de ubicación.');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({});
      setUbicacion({ lat: posicion.coords.latitude, lng: posicion.coords.longitude });
    } catch {
      mostrarAlerta('Error', 'No se pudo obtener tu ubicación.');
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  // --- Preguntas adicionales ---
  const agregarPregunta = () => {
    setPreguntas((prev) => [...prev, { label: '', type: 'text', required: false }]);
  };
  const actualizarPregunta = (index: number, cambios: Partial<OfferQuestionInput>) => {
    setPreguntas((prev) => prev.map((p, i) => (i === index ? { ...p, ...cambios } : p)));
  };
  const quitarPregunta = (index: number) => {
    setPreguntas((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Envío: cobrar 1 USD y solo si aprueba, publicar ---
  const onSubmit = async (valores: OfertaFormValues) => {
    const preguntasInvalidas = preguntas.some((p) => !p.label.trim());
    if (preguntasInvalidas) {
      mostrarAlerta('Revisa las preguntas', 'Cada pregunta adicional necesita un texto.');
      return;
    }

    setPublicando(true);
    try {
      const pago = await cobrarPago({
        cardNumber: valores.cardNumber,
        cvv: valores.cvv,
        expMonth: Number(valores.expMonth),
        expYear: Number(valores.expYear),
        cardholder: valores.cardholder || undefined,
      });

      await publicarOferta({
        jobTypeKey: valores.jobTypeKey,
        contractType: valores.contractType,
        description: valores.description,
        address: valores.address,
        photo: valores.photoUrl,
        paymentId: pago.id,
        location: ubicacion ?? undefined,
        payment: { amount: pago.amount ?? 1, currency: pago.currency ?? 'USD' },
        deadline: valores.deadline || undefined,
        questions: preguntas.length > 0 ? preguntas : undefined,
      });

      mostrarAlerta('Oferta publicada', 'Tu oferta ya está visible para los aplicantes.');
      router.replace('/mis-ofertas');
    } catch (e) {
      mostrarAlerta('No se pudo publicar', mensajeDeError(e));
    } finally {
      setPublicando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.titulo}>
          Publicar oferta
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          Tipo de empleo
        </ThemedText>
        {cargandoTipos ? (
          <ThemedText type="small" themeColor="textSecondary">
            Cargando tipos de empleo...
          </ThemedText>
        ) : (
          <Controller
            control={control}
            name="jobTypeKey"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                {tiposEmpleo.map((t) => (
                  <Pressable
                    key={t.key}
                    onPress={() => onChange(t.key)}
                    style={[styles.chip, value === t.key && styles.chipActivo]}>
                    <ThemedText type="small" themeColor={value === t.key ? 'background' : 'text'}>
                      {t.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          />
        )}
        {errors.jobTypeKey && <ThemedText style={styles.errorTexto}>{errors.jobTypeKey.message}</ThemedText>}

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Tipo de contrato
        </ThemedText>
        <Controller
          control={control}
          name="contractType"
          render={({ field: { onChange, value } }) => (
            <ThemedView style={styles.filaChips}>
              {TIPOS_CONTRATO.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => onChange(t.value)}
                  style={[styles.chip, value === t.value && styles.chipActivo]}>
                  <ThemedText type="small" themeColor={value === t.value ? 'background' : 'text'}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        />
        {errors.contractType && <ThemedText style={styles.errorTexto}>{errors.contractType.message}</ThemedText>}

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Descripción
        </ThemedText>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.inputMultilinea]}
            />
          )}
        />
        {errors.description && <ThemedText style={styles.errorTexto}>{errors.description.message}</ThemedText>}

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Dirección
        </ThemedText>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <ThemedTextInput value={value} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
          )}
        />
        {errors.address && <ThemedText style={styles.errorTexto}>{errors.address.message}</ThemedText>}

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Ubicación (opcional)
        </ThemedText>
        <Pressable style={styles.botonSecundario} onPress={usarUbicacionActual} disabled={buscandoUbicacion}>
          <ThemedText type="small">
            {buscandoUbicacion
              ? 'Buscando...'
              : ubicacion
                ? `Ubicación: ${ubicacion.lat.toFixed(4)}, ${ubicacion.lng.toFixed(4)}`
                : 'Usar mi ubicación actual'}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Foto (obligatoria)
        </ThemedText>
        {fotoPreview && <Image source={{ uri: fotoPreview }} style={styles.preview} />}
        <ThemedView style={styles.filaChips}>
          <Pressable style={styles.botonSecundario} onPress={() => subirDesde('camara')} disabled={subiendoFoto}>
            <ThemedText type="small">Tomar foto</ThemedText>
          </Pressable>
          <Pressable style={styles.botonSecundario} onPress={() => subirDesde('galeria')} disabled={subiendoFoto}>
            <ThemedText type="small">Elegir de galería</ThemedText>
          </Pressable>
        </ThemedView>
        {subiendoFoto && (
          <ThemedText type="small" themeColor="textSecondary">
            Subiendo foto...
          </ThemedText>
        )}
        {errors.photoUrl && <ThemedText style={styles.errorTexto}>{errors.photoUrl.message}</ThemedText>}

        <ThemedText type="small" themeColor="textSecondary" style={styles.seccion}>
          Fecha límite (opcional, AAAA-MM-DD)
        </ThemedText>
        <Controller
          control={control}
          name="deadline"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput value={value} onChangeText={onChange} placeholder="2026-08-30" style={styles.input} />
          )}
        />

        {/* Campos personalizados del tipo de empleo seleccionado, si el API los trae */}
        {tipoSeleccionado?.customFields && tipoSeleccionado.customFields.length > 0 && (
          <ThemedView style={styles.aviso}>
            <ThemedText type="small">
              Este tipo de empleo trae campos personalizados ({tipoSeleccionado.customFields.map((c) => c.label).join(', ')}).
              Captúralos como preguntas adicionales abajo si aplica.
            </ThemedText>
          </ThemedView>
        )}

        <ThemedText type="subtitle" style={styles.seccionGrande}>
          Preguntas adicionales
        </ThemedText>
        {preguntas.map((pregunta, index) => (
          <ThemedView key={index} style={styles.preguntaCard}>
            <ThemedTextInput
              placeholder="Texto de la pregunta"
              value={pregunta.label}
              onChangeText={(v) => actualizarPregunta(index, { label: v })}
              style={styles.input}
            />
            <ThemedView style={styles.filaChips}>
              {TIPOS_PREGUNTA.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => actualizarPregunta(index, { type: t.value })}
                  style={[styles.chipChico, pregunta.type === t.value && styles.chipActivo]}>
                  <ThemedText type="small" themeColor={pregunta.type === t.value ? 'background' : 'text'}>
                    {t.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
            {pregunta.type === 'select' && (
              <ThemedTextInput
                placeholder="Opciones separadas por coma"
                value={(pregunta.options ?? []).join(', ')}
                onChangeText={(v) =>
                  actualizarPregunta(index, { options: v.split(',').map((o) => o.trim()).filter(Boolean) })
                }
                style={styles.input}
              />
            )}
            <Pressable onPress={() => quitarPregunta(index)}>
              <ThemedText type="small" style={styles.errorTexto}>
                Quitar pregunta
              </ThemedText>
            </Pressable>
          </ThemedView>
        ))}
        <Pressable onPress={agregarPregunta}>
          <ThemedText type="linkPrimary">+ Agregar pregunta</ThemedText>
        </Pressable>

        <ThemedText type="subtitle" style={styles.seccionGrande}>
          Pago (1.00 USD para publicar)
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tarjeta de prueba aprobada: 4242424242424242 · Rechazada: 4000000000000002
        </ThemedText>
        <Controller
          control={control}
          name="cardNumber"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              placeholder="Número de tarjeta"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />
        {errors.cardNumber && <ThemedText style={styles.errorTexto}>{errors.cardNumber.message}</ThemedText>}
        <ThemedView style={styles.filaChips}>
          <Controller
            control={control}
            name="cvv"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                placeholder="CVV"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                style={[styles.input, { flex: 1 }]}
              />
            )}
          />
          <Controller
            control={control}
            name="expMonth"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                placeholder="Mes"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                style={[styles.input, { flex: 1 }]}
              />
            )}
          />
          <Controller
            control={control}
            name="expYear"
            render={({ field: { onChange, value } }) => (
              <ThemedTextInput
                placeholder="Año"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                style={[styles.input, { flex: 1 }]}
              />
            )}
          />
        </ThemedView>
        {(errors.cvv || errors.expMonth || errors.expYear) && (
          <ThemedText style={styles.errorTexto}>
            {errors.cvv?.message || errors.expMonth?.message || errors.expYear?.message}
          </ThemedText>
        )}
        <Controller
          control={control}
          name="cardholder"
          render={({ field: { onChange, value } }) => (
            <ThemedTextInput
              placeholder="Nombre en la tarjeta (opcional)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        <Pressable style={styles.botonPrincipal} onPress={handleSubmit(onSubmit)} disabled={publicando}>
          <ThemedText themeColor="background" type="smallBold">
            {publicando ? 'Publicando...' : 'Pagar y publicar'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, minHeight: 0 },
  scroll: { padding: Spacing.four, gap: Spacing.one, paddingBottom: Spacing.six },
  titulo: { fontSize: 24, lineHeight: 28, marginBottom: Spacing.two },
  seccion: { marginTop: Spacing.three },
  seccionGrande: { fontSize: 18, lineHeight: 22, marginTop: Spacing.five, marginBottom: Spacing.one },
  chips: { flexDirection: 'row', marginTop: Spacing.one },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    marginRight: Spacing.two,
  },
  chipChico: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
  },
  chipActivo: { backgroundColor: '#3c87f7', borderColor: '#3c87f7' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    marginTop: Spacing.one,
  },
  inputMultilinea: { minHeight: 90, textAlignVertical: 'top' },
  errorTexto: { color: '#e5484d', fontSize: 13, marginTop: 2 },
  botonSecundario: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  preview: { width: '100%', height: 180, borderRadius: Spacing.two, marginTop: Spacing.one },
  aviso: {
    backgroundColor: '#3c87f71a',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    marginTop: Spacing.two,
  },
  preguntaCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  botonPrincipal: {
    backgroundColor: '#16a34a',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.five,
  },
});
