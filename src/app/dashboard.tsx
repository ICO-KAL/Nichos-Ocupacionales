import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreelancerProfile, useAuth } from '@/auth/auth-context';

const currencies = [
  { code: 'COP', label: 'Peso colombiano', symbol: '$' },
  { code: 'USD', label: 'Dolar estadounidense', symbol: 'US$' },
  { code: 'MXN', label: 'Peso mexicano', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: 'EUR' },
];

const emptyProfile: FreelancerProfile = {
  profession: '', specialty: '', country: '', yearsOfExperience: 0, currency: 'COP', taxRate: 0,
};

export default function DashboardScreen() {
  const { user, isLoading, signOut, getProfile, saveProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profile, setProfile] = useState<FreelancerProfile>(emptyProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    getProfile()
      .then((savedProfile) => { if (active && savedProfile) setProfile(savedProfile); })
      .catch((error: Error) => { if (active) setFeedback(error.message); })
      .finally(() => { if (active) setIsProfileLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#0E7490" size="large" /></View>;
  }
  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace('/login');
  }

  function updateProfile<Key extends keyof FreelancerProfile>(key: Key, value: FreelancerProfile[Key]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setFeedback('');
  }

  async function handleSave() {
    setIsSaving(true);
    setFeedback('');
    try {
      const savedProfile = await saveProfile(profile);
      setProfile(savedProfile);
      setFeedback('Perfil profesional guardado correctamente.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No fue posible guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isProfileLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#0E7490" size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>PRESUPUESTO</Text>
          <Text style={styles.overline}>PERFIL PROFESIONAL</Text>
        </View>
        <Pressable disabled={isSigningOut} onPress={handleSignOut} style={({ pressed }) => [styles.signOut, (pressed || isSigningOut) && styles.pressed]}>
          <Text style={styles.signOutText}>{isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.greeting}>Perfil de {user.name}</Text>
          <Text style={styles.copy}>Esta informacion personaliza las recomendaciones y prepara sus futuros calculos de tarifa.</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Datos profesionales</Text>
          <Field label="Profesion" value={profile.profession} onChangeText={(value) => updateProfile('profession', value)} placeholder="Ej. Disenadora UX" />
          <Field label="Especialidad" value={profile.specialty} onChangeText={(value) => updateProfile('specialty', value)} placeholder="Ej. Diseno de productos digitales" />
          <Field label="Pais" value={profile.country} onChangeText={(value) => updateProfile('country', value)} placeholder="Ej. Colombia" />
          <Field label="Anos de experiencia" value={String(profile.yearsOfExperience)} onChangeText={(value) => updateProfile('yearsOfExperience', Number(value.replace(/[^0-9]/g, '')) || 0)} keyboardType="number-pad" />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Configuracion financiera</Text>
          <Text style={styles.label}>Moneda principal</Text>
          <View style={styles.currencyGrid}>
            {currencies.map((currency) => (
              <Pressable key={currency.code} onPress={() => updateProfile('currency', currency.code)} style={({ pressed }) => [styles.currencyOption, profile.currency === currency.code && styles.currencyOptionActive, pressed && styles.pressed]}>
                <Text style={[styles.currencySymbol, profile.currency === currency.code && styles.currencyTextActive]}>{currency.symbol}</Text>
                <View><Text style={[styles.currencyCode, profile.currency === currency.code && styles.currencyTextActive]}>{currency.code}</Text><Text style={styles.currencyLabel}>{currency.label}</Text></View>
              </Pressable>
            ))}
          </View>
          <Field label="Impuesto estimado" value={String(profile.taxRate)} onChangeText={(value) => updateProfile('taxRate', Number(value.replace(/[^0-9.]/g, '')) || 0)} keyboardType="decimal-pad" suffix="%" />
          <Text style={styles.helper}>Puede indicar un valor entre 0 % y 100 %. Este porcentaje se mostrara dentro de sus tarifas.</Text>
        </View>

        {!!feedback && <Text style={[styles.feedback, feedback.includes('correctamente') ? styles.success : styles.error]}>{feedback}</Text>}
        <Pressable disabled={isSaving} onPress={handleSave} style={({ pressed }) => [styles.saveButton, (pressed || isSaving) && styles.pressed]}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar perfil'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: 'default' | 'number-pad' | 'decimal-pad'; suffix?: string };

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', suffix }: FieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.inputRow}><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#829AB1" keyboardType={keyboardType} style={styles.input} maxLength={80} />{suffix && <Text style={styles.suffix}>{suffix}</Text>}</View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F8' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7F8' },
  header: { paddingHorizontal: 24, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#D9E2EC' },
  brand: { color: '#102A43', fontWeight: '800', fontSize: 13, letterSpacing: 1.6 },
  overline: { color: '#B45309', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  signOut: { borderWidth: 1, borderColor: '#0E7490', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  signOutText: { color: '#0E7490', fontWeight: '800', fontSize: 14 },
  content: { maxWidth: 700, width: '100%', alignSelf: 'center', padding: 24, paddingBottom: 44 },
  intro: { marginBottom: 28 },
  greeting: { color: '#102A43', fontSize: 28, lineHeight: 34, fontWeight: '800' },
  copy: { color: '#526B7A', fontSize: 16, lineHeight: 24, marginTop: 10 },
  formSection: { borderTopWidth: 1, borderTopColor: '#D9E2EC', paddingTop: 22, marginTop: 18 },
  sectionTitle: { color: '#102A43', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  field: { marginTop: 16 },
  label: { color: '#243B53', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  inputRow: { minHeight: 48, borderWidth: 1, borderColor: '#BCCCDC', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center' },
  input: { color: '#102A43', fontSize: 16, paddingHorizontal: 13, paddingVertical: 11, flex: 1, minWidth: 0 },
  suffix: { color: '#486581', fontSize: 16, fontWeight: '800', paddingHorizontal: 13 },
  currencyGrid: { gap: 10, marginTop: 4 },
  currencyOption: { minHeight: 58, borderWidth: 1, borderColor: '#BCCCDC', backgroundColor: '#FFFFFF', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  currencyOptionActive: { borderColor: '#0E7490', borderWidth: 2, backgroundColor: '#E0FCFF' },
  currencySymbol: { color: '#0E7490', fontSize: 20, fontWeight: '800', minWidth: 32, textAlign: 'center' },
  currencyCode: { color: '#243B53', fontSize: 14, fontWeight: '800' },
  currencyLabel: { color: '#627D98', fontSize: 12, marginTop: 2 },
  currencyTextActive: { color: '#0E7490' },
  helper: { color: '#627D98', fontSize: 13, lineHeight: 19, marginTop: 8 },
  feedback: { marginTop: 24, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  success: { color: '#15803D' },
  error: { color: '#B91C1C' },
  saveButton: { minHeight: 52, marginTop: 16, backgroundColor: '#0E7490', alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.65 },
});