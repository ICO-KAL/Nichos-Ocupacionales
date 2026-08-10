# Welcome to your Expo app 👋

## Calculadora de Presupuestos para Freelancers

Aplicacion para que trabajadores independientes accedan a un espacio personal desde el que administraran sus calculos y presupuestos. La EPICA F-01 implementa registro, inicio de sesion, recuperacion de contrasena y cierre de sesion.

### Funcionalidades de acceso

- **HU-F001 - Crear una cuenta:** registro con nombre, correo y contrasena. El correo es unico y la contrasena exige 8 caracteres, una mayuscula, una minuscula y un numero.
- **HU-F002 - Iniciar sesion:** validacion de credenciales, creacion de una sesion de ocho horas y redireccion al panel principal.
- **HU-F003 - Recuperar contrasena:** generacion de un codigo de un solo uso que expira en 15 minutos y permite establecer una nueva contrasena.
- **HU-F004 - Cerrar sesion:** invalida la sesion del servidor, elimina el token local y regresa a la pantalla de acceso.

### Tecnologias

- Cliente: Expo SDK 57, React Native, Expo Router y TypeScript.
- API: Node.js, Express, MongoDB, `bcryptjs`, `jsonwebtoken`, `dotenv` y `cors`.
- Token: `expo-secure-store` en Android e iOS; `sessionStorage` para la version web.
- Librerias del proyecto disponibles para validacion y estado: React Hook Form, Zod y Zustand.

### Configuracion local

1. Instale las dependencias con `npm install`.
2. Cree el archivo `.env` a partir de `.env.example`. `.env` esta ignorado por Git y no debe subirse al repositorio.
3. Configure estas variables:

   ```dotenv
   MONGODB_URI=mongodb+srv://<usuario>:<contrasena>@<cluster>.mongodb.net/
   MONGODB_DB=InnovaTechSolutions
   JWT_SECRET=<clave-aleatoria-de-al-menos-32-caracteres>
   PORT=3001
   NODE_ENV=development
   EXPO_PUBLIC_API_URL=http://localhost:3001/api
   ```

La configuracion local de este proyecto usa la base de datos `InnovaTechSolutions`. MongoDB no admite espacios en nombres de base de datos. La cadena de conexion debe existir solamente en `.env`, nunca en archivos fuente ni en el repositorio.

### Ejecutar cliente y API

Inicie la API en una terminal:

```bash
npm run api
```

En una segunda terminal, inicie Expo:

```bash
npm start
```

Para probar en Expo Go desde un telefono fisico, reemplace `localhost` en `EXPO_PUBLIC_API_URL` por la IP local del equipo, por ejemplo `http://192.168.1.10:3001/api`, y reinicie Expo. El telefono y el equipo deben estar en la misma red.

### Seguridad y flujo

Las contrasenas se validan tanto en la aplicacion como en la API, se almacenan unicamente como hashes `bcrypt` con costo 12 y nunca se devuelven al cliente. La API mantiene una coleccion de sesiones para invalidar tokens al cerrar sesion. Los codigos de recuperacion se almacenan hasheados y se eliminan, junto con las sesiones activas, cuando se actualiza la contrasena.

En desarrollo, la API devuelve el codigo temporal para probar el flujo. En produccion no lo expone: debe conectarse a un proveedor de correo o mensajeria autorizado para entregarlo al usuario.

### Verificacion

```bash
npx tsc --noEmit
node src/backend/nichoHerramientasBD.ts
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
