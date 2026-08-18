import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Confirmation = {
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

let listener: ((confirmation: Confirmation) => void) | null = null;

export function confirmarAccion(confirmation: Confirmation) {
  listener?.(confirmation);
}

export function ConfirmationDialogHost() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    listener = setConfirmation;
    return () => {
      listener = null;
    };
  }, []);

  const confirm = () => {
    const action = confirmation?.onConfirm;
    setConfirmation(null);
    action?.();
  };

  return (
    <Modal transparent animationType="fade" visible={confirmation !== null} onRequestClose={() => setConfirmation(null)}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={[styles.iconCircle, confirmation?.destructive && styles.iconCircleDestructive]}>
            <Text style={[styles.icon, confirmation?.destructive && styles.iconDestructive]}>
              {confirmation?.destructive ? '!' : '?'}
            </Text>
          </View>
          <Text style={styles.title}>{confirmation?.title}</Text>
          <Text style={styles.message}>{confirmation?.message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => setConfirmation(null)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={confirm}
              style={[styles.confirmButton, confirmation?.destructive && styles.confirmButtonDestructive]}
            >
              <Text style={styles.confirmText}>{confirmation?.confirmText ?? 'Confirmar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  dialog: { width: '100%', maxWidth: 380, alignItems: 'center', borderRadius: 18, padding: 24, backgroundColor: '#ffffff' },
  iconCircle: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#93c5fd', borderRadius: 29, backgroundColor: '#eff6ff' },
  iconCircleDestructive: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  icon: { color: '#2563eb', fontSize: 30, fontWeight: '700' },
  iconDestructive: { color: '#dc2626' },
  title: { color: '#102a43', fontSize: 20, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  message: { color: '#526b7a', fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  actions: { flexDirection: 'row', width: '100%', gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, backgroundColor: '#ffffff' },
  cancelText: { color: '#334e68', fontSize: 14, fontWeight: '800' },
  confirmButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#2563eb' },
  confirmButtonDestructive: { backgroundColor: '#dc2626' },
  confirmText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
