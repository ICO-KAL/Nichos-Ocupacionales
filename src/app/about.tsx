import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { ContentState, PublicScreen, RemoteImage } from '@/components/public-ui';
import { teamMembers, TeamMember } from '@/data/team';

async function openExternalLink(url: string, unavailableMessage: string) {
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert('Enlace no disponible', unavailableMessage);
    return;
  }
  await Linking.openURL(url);
}

function MemberCard({ member }: { member: TeamMember }) {
  const phoneUrl = member.phone ? `tel:${member.phone.replace(/[^+\d]/g, '')}` : null;
  const telegramUrl = member.telegramUsername
    ? `https://t.me/${member.telegramUsername.replace(/^@/, '')}`
    : null;

  return (
    <View style={styles.card}>
      {member.photo ? (
        typeof member.photo === 'string' ? (
          <RemoteImage source={member.photo} style={styles.photo} />
        ) : (
          <Image contentFit="cover" source={member.photo} style={styles.photo} transition={180} />
        )
      ) : (
        <View style={styles.photoFallback}>
          <Text style={styles.photoFallbackText}>{member.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.studentId}>Matrícula: {member.studentId}</Text>
        {member.description ? <Text style={styles.description}>{member.description}</Text> : null}
        {phoneUrl ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openExternalLink(phoneUrl, 'Este dispositivo no puede abrir llamadas telefónicas.')}
            style={({ pressed }) => [styles.phoneButton, pressed && styles.pressed]}>
            <Text style={styles.phoneButtonText}>Llamar al {member.phone}</Text>
          </Pressable>
        ) : null}
        {telegramUrl ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => openExternalLink(telegramUrl, 'Telegram no está disponible en este dispositivo.')}
            style={({ pressed }) => [styles.telegramButton, pressed && styles.pressed]}>
            <Text style={styles.telegramButtonText}>Abrir Telegram</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <PublicScreen title="Acerca de nosotros">
      <Text style={styles.intro}>El equipo detrás de INNOVATECH SOLUTIONS.</Text>
      {teamMembers.length === 0 ? (
        <ContentState
          title="Integrantes por configurar"
          description="Agregue los datos confirmados del equipo para publicar sus medios de contacto."
        />
      ) : (
        teamMembers.map((member) => <MemberCard key={member.studentId} member={member} />)
      )}
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: '#526B7A', fontSize: 15, lineHeight: 22, marginBottom: 4 },
  card: { overflow: 'hidden', flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#DCE5F0', backgroundColor: '#FFFFFF' },
  photo: { width: 116, minHeight: 186 },
  photoFallback: { width: 96, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CFFAFE' },
  photoFallbackText: { color: '#0E7490', fontSize: 34, fontWeight: '800' },
  content: { flex: 1, padding: 16, gap: 9 },
  name: { color: '#102A43', fontSize: 19, lineHeight: 25, fontWeight: '800' },
  studentId: { color: '#526B7A', fontSize: 14, lineHeight: 20 },
  description: { color: '#334E68', fontSize: 14, lineHeight: 20 },
  phoneButton: { alignSelf: 'flex-start', minHeight: 38, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 6, marginTop: 3, backgroundColor: '#075985' },
  phoneButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  telegramButton: { alignSelf: 'flex-start', minHeight: 34, justifyContent: 'center', paddingHorizontal: 4 },
  telegramButtonText: { color: '#075985', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});