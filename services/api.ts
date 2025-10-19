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
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      /* raw no era JSON */
    }

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
// Tipos de respuesta del generate
export type OtpGenerateOk = {
  ok: true;
  id_event: string;
  expires_at: string;
  otp?: string; // solo en dev si returnOtpInResponse=true
};

export type OtpGenerateErr = {
  ok: false;
  error?: string;   // tu backend usa "error"
  message?: string; // compat
};

export type OtpGenerateResp = OtpGenerateOk | OtpGenerateErr;

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
    /** NUEVO: forzar regeneración si ya existe un OTP activo */
    replaceActive?: boolean;
  }
): Promise<OtpGenerateResp> {
  const {
    email,
    channel = "email",
    ttlSeconds,
    metadata,
    returnOtpInResponse,
    token,
    replaceActive, // <-- nuevo
  } = options ?? {};
  try {
    const data = await apiFetch<OtpGenerateOk>("/api/otp/generate", {
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
        ...(typeof replaceActive === "boolean" ? { replaceActive } : {}), // <-- enviar flag
      },
    });
    return data; // ok:true...
  } catch (error: any) {
    // Normaliza error para que el front NO truene por tipos
    const body = error?.body;
    const errMsg =
      (body && (body.error || body.message)) ||
      error?.message ||
      "No se pudo generar OTP.";
    return { ok: false, error: String(errMsg) };
  }
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
    return { ok: true, message: (res as any)?.message ?? "Actualizado." };
  } catch (error: any) {
    return { ok: false, message: error?.message ?? "No se pudo actualizar el usuario." };
  }
}

// --------- OTP: Verificar ----------------------------------------------
export type OtpVerifyResponse = {
  ok: boolean;
  reason?: string;
  message?: string;
  details?: Record<string, any>;
};

export async function otpVerify(
  id_accion: string,
  otp: string,
  opts?: { id_event?: string; email?: string; debug?: boolean }
): Promise<OtpVerifyResponse> {
  const body: Record<string, string> = {
    id_accion,
    otp: otp.normalize("NFKC").replace(/\D+/g, ""), // solo dígitos
  };
  if (opts?.id_event) body.id_event = opts.id_event;
  if (opts?.email) body.email = opts.email;

  const headers: Record<string, string> = {};
  if (opts?.debug && process.env.NODE_ENV !== "production") {
    headers["x-debug"] = "1";
  }

  try {
    return await apiFetch<OtpVerifyResponse>("/api/otp/verify", {
      method: "POST",
      headers,
      body,
    });
  } catch (error: any) {
    // Normaliza error para que el front lo pueda mostrar
    const body = error?.body;
    const reason = body?.reason || undefined;
    const message = body?.message || body?.error || error?.message || "Error al verificar OTP.";
    const details = body?.details || undefined;
    return { ok: false, reason, message, details };
  }
}
