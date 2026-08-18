// src/lib/alert.ts
// Alert.alert de React Native es un no-op en la web (react-native-web lo
// implementa como `static alert() {}`, literalmente vacío) — por eso
// ninguna alerta se veía al probar en el navegador. Esto no es un bug de
// una pantalla en particular, afecta CUALQUIER Alert.alert en web.
//
// Usa mostrarAlerta() en vez de Alert.alert en TODAS las pantallas nuevas
// (y si tienen tiempo, migren las viejas) para que los mensajes sí se vean
// tanto en el celular como en el navegador durante las pruebas.

import { mostrarToast } from '@/components/toast';

interface BotonAlerta {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function mostrarAlerta(titulo: string, mensaje?: string, botones?: BotonAlerta[]): void {
  const normalizedTitle = titulo.toLowerCase();
  const type =
    normalizedTitle.includes('error') || normalizedTitle.includes('rechaz')
      ? 'error'
      : normalizedTitle.includes('permiso') || normalizedTitle.includes('revisa')
        ? 'warning'
        : 'success';
  mostrarToast(titulo, mensaje, type);
  botones?.find((button) => button.style !== 'cancel')?.onPress?.();
}
