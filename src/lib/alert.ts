// src/lib/alert.ts
// Alert.alert de React Native es un no-op en la web (react-native-web lo
// implementa como `static alert() {}`, literalmente vacío) — por eso
// ninguna alerta se veía al probar en el navegador. Esto no es un bug de
// una pantalla en particular, afecta CUALQUIER Alert.alert en web.
//
// Usa mostrarAlerta() en vez de Alert.alert en TODAS las pantallas nuevas
// (y si tienen tiempo, migren las viejas) para que los mensajes sí se vean
// tanto en el celular como en el navegador durante las pruebas.

import { Alert as AlertNativo, Platform } from 'react-native';

interface BotonAlerta {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function mostrarAlerta(titulo: string, mensaje?: string, botones?: BotonAlerta[]): void {
  if (Platform.OS === 'web') {
    const texto = mensaje ? `${titulo}\n\n${mensaje}` : titulo;

    if (botones && botones.length > 1) {
      // Con 2+ botones (ej. Cancelar/Confirmar), usamos confirm() del navegador.
      const aceptado = window.confirm(texto);
      const boton = aceptado
        ? (botones.find((b) => b.style !== 'cancel') ?? botones[botones.length - 1])
        : botones.find((b) => b.style === 'cancel');
      boton?.onPress?.();
      return;
    }

    window.alert(texto);
    botones?.[0]?.onPress?.();
    return;
  }

  AlertNativo.alert(titulo, mensaje, botones);
}
