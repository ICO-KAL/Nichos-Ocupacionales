import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'warning' | 'error';

type ToastMessage = {
  id: number;
  title: string;
  message?: string;
  type: ToastType;
};

let listener: ((message: ToastMessage) => void) | null = null;
let sequence = 0;

export function mostrarToast(title: string, message?: string, type: ToastType = 'success') {
  listener?.({ id: ++sequence, title, message, type });
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    listener = setToast;
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.toast,
          toast.type === 'success' && styles.success,
          toast.type === 'warning' && styles.warning,
          toast.type === 'error' && styles.error,
        ]}
      >
        <View style={[styles.iconCircle, toast.type === 'success' && styles.successIcon, toast.type === 'warning' && styles.warningIcon, toast.type === 'error' && styles.errorIcon]}>
          <Text style={styles.icon}>
            {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '×'}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, toast.type === 'success' && styles.successText, toast.type === 'warning' && styles.warningText, toast.type === 'error' && styles.errorText]}>
            {toast.title}
          </Text>
          {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  warning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  error: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    marginRight: 12,
  },
  successIcon: {
    backgroundColor: '#15803d',
  },
  warningIcon: {
    backgroundColor: '#b45309',
  },
  errorIcon: {
    backgroundColor: '#b91c1c',
  },
  icon: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  successText: { color: '#166534' },
  warningText: { color: '#b45309' },
  errorText: { color: '#b91c1c' },
  message: {
    color: '#334e68',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
});
