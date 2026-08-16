// src/components/themed-text-input.tsx
// TextInput normal de RN no hereda color de texto del tema — en modo
// oscuro el navegador le pone texto negro por defecto, invisible sobre
// fondo negro. Este wrapper aplica el color correcto según el tema activo.
import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput(
  { style, ...props },
  ref
) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={theme.textSecondary}
      style={[{ color: theme.text }, style]}
      {...props}
    />
  );
});
