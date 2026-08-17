# Welcome to your Expo app 👋

## Ocupa2 — Cliente Expo

Aplicacion cliente de Ocupa2 con autenticacion, perfil, flujo de aplicante y flujo de publicador. Cuando el API no esta disponible, la app funciona con base de datos local JSON (AsyncStorage).

### Funcionalidades de acceso

- **HU-F001 - Crear una cuenta:** registro con nombre, correo y contrasena. El correo es unico y la contrasena exige 8 caracteres, una mayuscula, una minuscula y un numero.
- **HU-F002 - Iniciar sesion:** validacion de credenciales, creacion de una sesion de ocho horas y redireccion al panel principal.
- **HU-F003 - Recuperar contrasena:** generacion de un codigo de un solo uso que expira en 15 minutos y permite establecer una nueva contrasena.
- **HU-F004 - Cerrar sesion:** invalida la sesion del servidor, elimina el token local y regresa a la pantalla de acceso.

### Tecnologias

- Cliente: Expo SDK 57, React Native, Expo Router y TypeScript.
- Persistencia local: JSON en AsyncStorage.
- Token: `expo-secure-store` en Android e iOS; `sessionStorage` para la version web.
- Librerias del proyecto disponibles para validacion y estado: React Hook Form, Zod y Zustand.

### Configuracion local

1. Instale las dependencias con `npm install`.
2. Opcionalmente configure:

   ```dotenv
   EXPO_PUBLIC_DATA_MODE=local
   ```
3. Inicie Expo:

```bash
npm start
```

### Verificacion

```bash
npx tsc --noEmit
npm run lint
```

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
