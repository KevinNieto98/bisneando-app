// src/lib/api.ts
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? ""; // p.ej. https://tu-dominio.com

// --------- Helper genérico ---------------------------------------------
type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  // timeout en ms (default 12s)
  timeoutMs?: number;
};

async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers, timeoutMs = 12000 } = opts;

  if (!API_BASE) {
    throw new Error("API base URL no definida. Configura EXPO_PUBLIC_API_URL.");
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // intenta json -> si falla, usa texto
    const raw = await res.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { /* raw no era JSON */ }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        raw || // muestra el texto del error si no hay JSON
        `HTTP ${res.status} ${res.statusText}`;

      const err = new Error(
        `[API ERROR] ${method} ${url} -> ${res.status} ${res.statusText}\n` +
        `Respuesta: ${msg}`
      ) as any;
      err.status = res.status;
      err.statusText = res.statusText;
      err.url = url;
      err.method = method;
      err.body = data ?? raw;
      throw err;
    }

    return (data ?? ({} as any)) as T;
  } catch (err) {
    if ((err as any)?.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al contactar la API.");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

// --------- Endpoints concretos -----------------------------------------
export async function fetchCategorias() {
  try {
    return await apiFetch<any[]>("/api/categorias");
  } catch (error) {
    console.error("Error fetchCategorias:", error);
    return [];
  }
}

export async function fetchActivePortadas() {
  try {
    return await apiFetch<any[]>("/api/portadas");
  } catch (error) {
    console.error("Error fetchActivePortadas:", error);
    return [];
  }
}

export async function fetchProductosDestacados() {
  try {
    const params = new URLSearchParams({
      onlyActive: "true",
      orderBy: "fecha_creacion",
      orderDir: "desc",
      limit: "10",
    });
    return await apiFetch<any[]>(`/api/productos/?${params.toString()}`);
  } catch (error) {
    console.error("Error fetchProductosDestacados:", error);
    return [];
  }
}

export async function fetchProductoById(id: number) {
  try {
    return await apiFetch<any>(`/api/productos/${id}`);
  } catch (error) {
    console.error("fetchProductoById:", error);
    return null;
  }
}

// --------- Tipos (ajusta si tu API devuelve algo distinto) -------------
export type SignupPayload = {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  password: string;
  id_perfil: number;
};

export type SignupResult =
  | {
      ok: true;
      status: "created" | "pending_confirmation";
      tokens?: {
        access_token: string;
        refresh_token: string;
        expires_in?: number;
        token_type?: string;
      };
      user?: { id: string | null; email: string | null };
    }
  | { ok: false; message: string };

// --------- NUEVO: Signup -----------------------------------------------
export async function signupRequest(payload: SignupPayload): Promise<SignupResult> {
  try {
    const res = await apiFetch<SignupResult>("/api/signup", {
      method: "POST",
      body: payload,
    });

    // Normalizar por si el backend cambia pequeñas cosas
    if (res.ok === true && (res.status === "created" || res.status === "pending_confirmation")) {
      return res;
    }
    return { ok: false, message: "Respuesta inesperada del servidor." };
  } catch (error: any) {
    return { ok: false, message: error?.message ?? "No se pudo crear la cuenta." };
  }
}

// --------- Login (solo APP) -------------------------------------------
export type LoginResponse = {
  success: boolean;
  message: string;
  code?: string;
  status?: number;
  tokens?: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
  };
  user?: { id: string; email: string | null };
};

export async function loginRequestApp(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await apiFetch<LoginResponse>("/api/login", {
      method: "POST",
      body: { email, password, platform: "APP" }, // forzado APP
    });
    return res;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? "No se pudo iniciar sesión.",
    };
  }
}

// --------- Utilidad: Header de Autorización ----------------------------
function withAuthHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --------- OTP: Generar -----------------------------------------------
/** Generar OTP para una acción dada (p.ej. "verify_account") */
export async function otpGenerate(
  id_accion: string,
  options?: {
    /** dirección de correo a la que se enviará el OTP (si aplica) */
    email?: string; // opcional para evitar romper llamadas antiguas
    /** canal de envío del OTP */
    channel?: "email" | "sms";
    /** tiempo de vida en segundos */
    ttlSeconds?: number;
    metadata?: Record<string, any>;
    /** solo para DEV: si true, el backend puede devolver el OTP en la respuesta si no es production */
    returnOtpInResponse?: boolean;
    /** access token del usuario (Supabase) */
    token?: string;
  }
) {
  const { email, channel = "email", ttlSeconds, metadata, returnOtpInResponse, token } = options ?? {};

  return await apiFetch<{
    ok: boolean;
    id_event: string;
    expires_at: string;
    otp?: string; // solo en dev si returnOtpInResponse=true
  }>("/api/otp/generate", {
    method: "POST",
    headers: {
      ...withAuthHeader(token),
    },
    body: {
      id_accion,
      ...(email ? { email } : {}),
      ...(channel ? { channel } : {}),
      ...(ttlSeconds ? { ttlSeconds } : {}),
      ...(metadata ? { metadata } : {}),
      ...(returnOtpInResponse ? { returnOtpInResponse: true } : {}),
    },
  });
}

// --------- OTP: Verificar ---------------------------------------------
/**
 * Verificar OTP
 * - Uso compatible con tu firma anterior:
 *    otpVerify("verify_account", "123456", token)
 * - Uso extendido (email opcional):
 *    otpVerify("verify_account", "123456", { email, token })
 */
export async function otpVerify(
  id_accion: string,
  otp: string,
  third?: string | { email?: string; token?: string }
) {
  const token = typeof third === "string" ? third : third?.token;
  const email = typeof third === "object" ? third?.email : undefined;

  return await apiFetch<{ ok: boolean; reason?: string }>("/api/otp/verify", {
    method: "POST",
    headers: {
      ...withAuthHeader(token),
    },
    body: {
      id_accion,
      otp,
      ...(email ? { email } : {}),
    },
  });
}
// --------- Usuarios: actualizar perfil actual (PUT + id) ----------------
export type UpdateUsuarioPayload = {
  id: string;               // ⬅️ requerido por tu API
  nombre?: string;
  apellido?: string;
  telefono?: string;
  dni?: string | null;      // dígitos o null
  email?: string;
  avatar_url?: string | null;
  phone_verified?: boolean;
};

export type UpdateUsuarioResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function actualizarUsuarioActual(
  payload: UpdateUsuarioPayload,
  token?: string
): Promise<UpdateUsuarioResult> {
  try {
    const res = await apiFetch<UpdateUsuarioResult>("/api/usuarios/actualizar", {
      method: "PUT",                   // ⬅️ TU API EXPORTA PUT
      headers: {
        ...withAuthHeader(token),
      },
      body: payload,                   // ⬅️ incluye { id, ... }
    });
    // Normaliza por si el backend no manda ok explícito
    if (res?.ok === true) return res;
    return { ok: true, message: res?.message ?? "Actualizado." };
  } catch (error: any) {
    return { ok: false, message: error?.message ?? "No se pudo actualizar el usuario." };
  }
}
