import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ActualizarAplicacionInput,
  Application,
  ContractType,
  JobType,
  Offer,
  OfferInput,
  Payment,
} from "./types";

const STORAGE_KEY = "ocupa2.local-json-db";

type LocalUser = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileCompleted: boolean;
  cedula?: string;
  gender?: string;
  birthDate?: string;
  referralMatricula?: string;
};

type LocalExperience = {
  id: string;
  userId: string;
  title: string;
  description: string;
  jobTypeKey: string;
  certificateImage: string;
  createdAt: string;
};

type LocalNews = {
  title: string;
  image: string;
  summary: string;
  date: string;
  url: string;
  source: string;
};

type LocalVideo = {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  order: number;
};

type LocalOffer = Offer & { ownerId: string };

type LocalApplication = Application & { applicantId: string };

type LocalPayment = Payment & { userId: string };

interface LocalDb {
  users: LocalUser[];
  experiences: LocalExperience[];
  jobTypes: JobType[];
  offers: LocalOffer[];
  applications: LocalApplication[];
  payments: LocalPayment[];
  news: LocalNews[];
  videos: LocalVideo[];
}

const nowIso = () => new Date().toISOString();
const id = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function seedDb(): LocalDb {
  const defaultJobTypes: (JobType & Record<string, unknown>)[] = [
    {
      id: "jt_delivery",
      key: "delivery",
      name: "Mensajería / Delivery",
      active: true,
      createdAt: nowIso(),
      customFields: [{ key: "licencia", label: "Licencia", type: "text" }],
    },
    {
      id: "jt_soporte",
      key: "soporte",
      name: "Soporte técnico",
      active: true,
      createdAt: nowIso(),
      customFields: [{ key: "herramientas", label: "Herramientas", type: "text" }],
    },
    {
      id: "jt_ventas",
      key: "ventas",
      name: "Ventas",
      active: true,
      createdAt: nowIso(),
      customFields: [{ key: "meta", label: "Meta mensual", type: "number" }],
    },
  ];

  return {
    users: [
      {
        id: "user_demo_1",
        email: "demo@ocupa2.local",
        password: "Demo1234",
        firstName: "Demo",
        lastName: "Local",
        profileCompleted: true,
        referralMatricula: "2026-0001",
      },
    ],
    experiences: [],
    jobTypes: defaultJobTypes,
    offers: [],
    applications: [],
    payments: [],
    news: [
      {
        title: "Consejos para entrevistas en empleos temporales",
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
        summary: "Buenas prácticas para destacar en entrevistas rápidas.",
        date: nowIso(),
        url: "https://example.com/news/entrevistas-temporales",
        source: "Ocupa2 Local",
      },
    ],
    videos: [
      {
        id: "video_1",
        youtubeId: "dQw4w9WgXcQ",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Cómo armar un perfil profesional efectivo",
        description: "Guía rápida para completar tu perfil y mejorar oportunidades.",
        thumbnail:
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=85",
        order: 1,
      },
    ],
  };
}

async function readDb(): Promise<LocalDb> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedDb();
    await writeDb(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw) as LocalDb;
  } catch {
    const seeded = seedDb();
    await writeDb(seeded);
    return seeded;
  }
}

async function writeDb(db: LocalDb) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function buildLocalToken(userId: string) {
  return `local-json:${userId}`;
}

function userIdFromToken(token?: string | null) {
  if (!token) return null;
  if (!token.startsWith("local-json:")) return null;
  return token.slice("local-json:".length);
}

function requireUser(db: LocalDb, token?: string | null): LocalUser {
  const userId = userIdFromToken(token);
  if (!userId) {
    throw new Error("Su sesion ha finalizado. Inicie sesion nuevamente.");
  }
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("Su sesion ha finalizado. Inicie sesion nuevamente.");
  }
  return user;
}

function toPublicUser(user: LocalUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileCompleted: user.profileCompleted,
    cedula: user.cedula,
    gender: user.gender,
    birthDate: user.birthDate,
    referralMatricula: user.referralMatricula,
  };
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function requestLocalJson<T>(args: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
}): Promise<T> {
  const method = args.method;
  const path = normalizePath(args.path);
  const db = await readDb();

  if (method === "POST" && path === "/auth/login") {
    const body = args.data as { email?: string; password?: string };
    const user = db.users.find(
      (u) => u.email.toLowerCase() === (body.email ?? "").toLowerCase(),
    );
    if (!user || user.password !== body.password) {
      throw new Error("Correo o contrasena inválidos.");
    }
    return {
      token: buildLocalToken(user.id),
      tokenType: "Bearer",
      user: toPublicUser(user),
    } as T;
  }

  if (method === "POST" && path === "/auth/register") {
    const body = args.data as {
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      referralMatricula?: string;
    };
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      throw new Error("Faltan campos obligatorios.");
    }
    const exists = db.users.some(
      (u) => u.email.toLowerCase() === body.email!.toLowerCase(),
    );
    if (exists) throw new Error("Ya existe una cuenta con ese correo.");

    const user: LocalUser = {
      id: id("user"),
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      profileCompleted: false,
      referralMatricula: body.referralMatricula ?? "",
    };
    db.users.push(user);
    await writeDb(db);
    return {
      token: buildLocalToken(user.id),
      tokenType: "Bearer",
      user: toPublicUser(user),
    } as T;
  }

  if (method === "POST" && path === "/auth/forgot-password") {
    return { message: "Solicitud registrada en modo local JSON." } as T;
  }

  if (method === "GET" && path === "/me") {
    const user = requireUser(db, args.token);
    return toPublicUser(user) as T;
  }

  if (method === "PUT" && path === "/me/profile") {
    const user = requireUser(db, args.token);
    const body = args.data as {
      firstName: string;
      lastName: string;
      cedula: string;
      gender: string;
      birthDate: string;
    };
    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.cedula = body.cedula;
    user.gender = body.gender;
    user.birthDate = body.birthDate;
    user.profileCompleted = true;
    await writeDb(db);
    return toPublicUser(user) as T;
  }

  if (method === "PUT" && path === "/me/password") {
    const user = requireUser(db, args.token);
    const body = args.data as { password?: string };
    if (!body.password) throw new Error("La contrasena es obligatoria.");
    user.password = body.password;
    await writeDb(db);
    return { message: "Contrasena actualizada." } as T;
  }

  if (method === "GET" && path === "/me/experiences") {
    const user = requireUser(db, args.token);
    return db.experiences.filter((x) => x.userId === user.id) as T;
  }

  if (method === "POST" && path === "/me/experiences") {
    const user = requireUser(db, args.token);
    const body = args.data as {
      title?: string;
      description?: string;
      jobTypeKey?: string;
      certificateImage?: string;
    };
    const exp: LocalExperience = {
      id: id("exp"),
      userId: user.id,
      title: body.title ?? "",
      description: body.description ?? "",
      jobTypeKey: body.jobTypeKey ?? "",
      certificateImage: body.certificateImage ?? "",
      createdAt: nowIso(),
    };
    db.experiences.push(exp);
    await writeDb(db);
    return exp as T;
  }

  if (method === "DELETE" && path.startsWith("/me/experiences/")) {
    const user = requireUser(db, args.token);
    const expId = path.split("/").pop()!;
    db.experiences = db.experiences.filter(
      (x) => !(x.id === expId && x.userId === user.id),
    );
    await writeDb(db);
    return { deleted: true } as T;
  }

  if (method === "GET" && path === "/job-types") {
    return db.jobTypes as T;
  }

  if (method === "POST" && path === "/uploads") {
    const body = args.data as { image?: unknown };
    if (typeof body.image !== "string" || !body.image.startsWith("data:image/")) {
      throw new Error("La imagen seleccionada no tiene un formato válido.");
    }
    return {
      key: id("upload"),
      // AsyncStorage conserva el data URI para que las imágenes locales se
      // puedan renderizar también en web, sin depender de una URL ficticia.
      url: body.image,
      mime: "image/jpeg",
      size: body.image.length,
    } as T;
  }

  if (method === "GET" && path === "/news") {
    const limitRaw = args.params?.limit;
    const limit = limitRaw ? Number(limitRaw) : db.news.length;
    return db.news.slice(0, Number.isFinite(limit) ? limit : db.news.length) as T;
  }

  if (method === "GET" && path === "/videos") {
    return db.videos as T;
  }

  if (method === "POST" && path === "/payments") {
    const user = requireUser(db, args.token);
    const payment: LocalPayment = {
      id: id("pay"),
      userId: user.id,
      amount: 1,
      currency: "USD",
      status: "approved",
      createdAt: nowIso(),
    };
    db.payments.push(payment);
    await writeDb(db);
    return payment as T;
  }

  if (method === "GET" && path === "/me/payments") {
    const user = requireUser(db, args.token);
    return db.payments.filter((p) => p.userId === user.id) as T;
  }

  if (method === "POST" && path === "/offers") {
    const user = requireUser(db, args.token);
    const body = args.data as OfferInput;
    const jobType = db.jobTypes.find((x) => x.key === body.jobTypeKey);
    const offer: LocalOffer = {
      id: id("offer"),
      ownerId: user.id,
      jobTypeKey: body.jobTypeKey,
      contractType: body.contractType as ContractType,
      description: body.description,
      address: body.address,
      photo: body.photo,
      location: body.location,
      payment: {
        amount: body.payment.amount,
        currency: body.payment.currency,
        period: "hora",
      },
      deadline: body.deadline,
      customAnswers: body.customAnswers,
      questions: body.questions,
      active: true,
      createdAt: nowIso(),
      applicationsCount: 0,
      likesCount: 0,
      jobTypeName: jobType?.name ?? body.jobTypeKey,
      status: "active",
      isIdentityRevealed: false,
      likedByMe: false,
    } as LocalOffer;
    db.offers.push(offer);
    await writeDb(db);
    return offer as T;
  }

  if (method === "GET" && path === "/offers") {
    const jobTypeKey = args.params?.jobTypeKey as string | undefined;
    const contractType = args.params?.contractType as string | undefined;
    let offers = db.offers.filter((o) => o.active !== false);
    if (jobTypeKey) offers = offers.filter((o) => o.jobTypeKey === jobTypeKey);
    if (contractType) offers = offers.filter((o) => o.contractType === contractType);
    return offers as T;
  }

  if (method === "GET" && /^\/offers\/[^/]+$/.test(path)) {
    const offerId = path.split("/")[2];
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer) throw new Error("No se encontró el recurso.");
    return offer as T;
  }

  if (method === "POST" && /^\/offers\/[^/]+\/apply$/.test(path)) {
    const user = requireUser(db, args.token);
    const offerId = path.split("/")[2];
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer) throw new Error("No se encontró el recurso.");
    const body = args.data as { comment?: string; answers?: Record<string, unknown> };
    const app: LocalApplication = {
      id: id("app"),
      offerId,
      applicantId: user.id,
      applicant: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      comment: body.comment ?? "",
      answers: Object.entries(body.answers ?? {}).map(([questionId, value]) => ({
        questionId,
        value,
      })),
      status: "applied",
      rating: 0,
      createdAt: nowIso(),
    };
    db.applications.push(app);
    offer.applicationsCount = (offer.applicationsCount ?? 0) + 1;
    await writeDb(db);
    return app as T;
  }

  if (method === "GET" && path === "/me/applications") {
    const user = requireUser(db, args.token);
    return db.applications
      .filter((a) => a.applicantId === user.id)
      .map((a) => {
        const offer = db.offers.find((o) => o.id === a.offerId);
        return { ...a, offer };
      }) as T;
  }

  if (method === "GET" && path === "/me/offers") {
    const user = requireUser(db, args.token);
    return db.offers.filter((o) => o.ownerId === user.id) as T;
  }

  if (method === "GET" && /^\/offers\/[^/]+\/applications$/.test(path)) {
    const user = requireUser(db, args.token);
    const offerId = path.split("/")[2];
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer || offer.ownerId !== user.id) throw new Error("No tienes permiso para hacer esto.");
    return db.applications.filter((a) => a.offerId === offerId) as T;
  }

  if (method === "PATCH" && /^\/applications\/[^/]+$/.test(path)) {
    const user = requireUser(db, args.token);
    const appId = path.split("/")[2];
    const app = db.applications.find((a) => a.id === appId);
    if (!app) throw new Error("No se encontró el recurso.");
    const offer = db.offers.find((o) => o.id === app.offerId);
    if (!offer || offer.ownerId !== user.id) throw new Error("No tienes permiso para hacer esto.");
    const body = args.data as ActualizarAplicacionInput;
    if (typeof body.rating === "number") app.rating = body.rating;
    if (body.status) app.status = body.status;
    await writeDb(db);
    return app as T;
  }

  if (method === "DELETE" && /^\/applications\/[^/]+$/.test(path)) {
    const user = requireUser(db, args.token);
    const appId = path.split("/")[2];
    const applicationIndex = db.applications.findIndex((app) => app.id === appId);
    const application = db.applications[applicationIndex];
    if (!application) throw new Error("No se encontró el recurso.");
    if (application.applicantId !== user.id) {
      throw new Error("No tienes permiso para hacer esto.");
    }
    if (application.status !== "applied") {
      throw new Error("Solo puedes cancelar postulaciones que están en revisión.");
    }

    db.applications.splice(applicationIndex, 1);
    const offer = db.offers.find((item) => item.id === application.offerId);
    if (offer) {
      offer.applicationsCount = Math.max(0, (offer.applicationsCount ?? 1) - 1);
    }
    await writeDb(db);
    return { deleted: true } as T;
  }

  if (method === "POST" && /^\/offers\/[^/]+\/deactivate$/.test(path)) {
    const user = requireUser(db, args.token);
    const offerId = path.split("/")[2];
    const offer = db.offers.find((o) => o.id === offerId);
    if (!offer || offer.ownerId !== user.id) throw new Error("No tienes permiso para hacer esto.");
    offer.active = false;
    await writeDb(db);
    return { ok: true } as T;
  }

  throw new Error(`Ruta local no implementada: ${method} ${path}`);
}
