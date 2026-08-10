import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";

import connection from "./nichoHerramientasBD.ts";

const port = Number(process.env.PORT ?? 3001);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 caracteres.");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function createAccessToken(user) {
  const sessionId = crypto.randomUUID();
  const expiresIn = "8h";
  const token = jwt.sign({ sub: user._id.toString(), sid: sessionId }, jwtSecret, { expiresIn });
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return { token, sessionId, expiresAt };
}

async function createSession(users, sessions, user) {
  const { token, sessionId, expiresAt } = createAccessToken(user);
  await sessions.insertOne({ sessionId, userId: user._id, expiresAt, createdAt: new Date() });
  return { token, user: publicUser(user) };
}

async function requireAuth(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    return response.status(401).json({ message: "Se requiere una sesion activa." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string" || !payload.sub || !payload.sid) {
      throw new Error("Token invalido.");
    }

    const database = await connection();
    const session = await database.collection("sessions").findOne({
      sessionId: payload.sid,
      userId: new (await import("mongodb")).ObjectId(payload.sub),
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return response.status(401).json({ message: "La sesion ya no es valida." });
    }

    request.auth = { userId: payload.sub, sessionId: payload.sid };
    return next();
  } catch {
    return response.status(401).json({ message: "La sesion ya no es valida." });
  }
}

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const name = String(request.body.name ?? "").trim();
    const email = String(request.body.email ?? "").trim().toLowerCase();
    const password = String(request.body.password ?? "");

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !passwordPattern.test(password)) {
      return response.status(400).json({
        message: "Ingrese un nombre, correo valido y una contrasena de 8 caracteres con mayuscula, minuscula y numero.",
      });
    }

    const database = await connection();
    const users = database.collection("users");
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return response.status(409).json({ message: "El correo electronico ya esta registrado." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await users.insertOne({ name, email, passwordHash, createdAt: new Date() });
    const user = { _id: result.insertedId, name, email };
    const session = await createSession(users, database.collection("sessions"), user);
    return response.status(201).json({ message: "Cuenta creada correctamente.", ...session });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ message: "El correo electronico ya esta registrado." });
    }
    return next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const email = String(request.body.email ?? "").trim().toLowerCase();
    const password = String(request.body.password ?? "");
    const database = await connection();
    const user = await database.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ message: "Correo o contrasena incorrectos." });
    }

    const session = await createSession(database.collection("users"), database.collection("sessions"), user);
    return response.json(session);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/forgot-password", async (request, response, next) => {
  try {
    const email = String(request.body.email ?? "").trim().toLowerCase();
    const database = await connection();
    const user = await database.collection("users").findOne({ email });
    const genericResponse = { message: "Si el correo esta registrado, recibira un codigo de recuperacion." };

    if (!user) {
      return response.json(genericResponse);
    }

    const code = crypto.randomBytes(24).toString("hex");
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const resetTokens = database.collection("passwordResetTokens");
    await resetTokens.deleteMany({ userId: user._id });
    await resetTokens.insertOne({
      userId: user._id,
      codeHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });

    if (process.env.NODE_ENV !== "production") {
      return response.json({ ...genericResponse, developmentCode: code });
    }
    return response.json(genericResponse);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/reset-password", async (request, response, next) => {
  try {
    const email = String(request.body.email ?? "").trim().toLowerCase();
    const code = String(request.body.code ?? "");
    const password = String(request.body.password ?? "");
    if (!passwordPattern.test(password)) {
      return response.status(400).json({ message: "La contrasena no cumple los requisitos de seguridad." });
    }

    const database = await connection();
    const user = await database.collection("users").findOne({ email });
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const resetToken = user
      ? await database.collection("passwordResetTokens").findOne({
          userId: user._id,
          codeHash,
          expiresAt: { $gt: new Date() },
        })
      : null;

    if (!user || !resetToken) {
      return response.status(400).json({ message: "El codigo no es valido o ya expiro." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await database.collection("users").updateOne({ _id: user._id }, { $set: { passwordHash } });
    await database.collection("passwordResetTokens").deleteMany({ userId: user._id });
    await database.collection("sessions").deleteMany({ userId: user._id });
    return response.json({ message: "Contrasena actualizada. Inicie sesion nuevamente." });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", requireAuth, async (request, response, next) => {
  try {
    const { ObjectId } = await import("mongodb");
    const database = await connection();
    const user = await database.collection("users").findOne({ _id: new ObjectId(request.auth.userId) });
    if (!user) {
      return response.status(401).json({ message: "La sesion ya no es valida." });
    }
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", requireAuth, async (request, response, next) => {
  try {
    const database = await connection();
    await database.collection("sessions").deleteOne({ sessionId: request.auth.sessionId });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, next) => {
  console.error("Error en la API de autenticacion:", error);
  response.status(500).json({ message: "No fue posible completar la solicitud." });
});

async function start() {
  const database = await connection();
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection("passwordResetTokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  app.listen(port, () => {
    console.log(`API de autenticacion disponible en http://localhost:${port}/api`);
  });
}

start().catch((error) => {
  console.error("No fue posible iniciar la API:", error);
  process.exitCode = 1;
});