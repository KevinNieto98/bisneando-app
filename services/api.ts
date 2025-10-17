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
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // intentar parsear JSON siempre que sea posible
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // si no hay cuerpo JSON, data se queda en null
    }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        `Error HTTP ${res.status} ${res.statusText}`;
      throw new Error(msg);
    }

    return data as T;
  } catch (err: any) {
    if (err?.name === "AbortError") {
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


// src/lib/api.ts  (añade debajo de tus exports actuales)

/** Inyecta Authorization si tienes un access token (Supabase) */
function withAuthHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Generar OTP para una acción dada (p.ej. "verify_account") */
export async function otpGenerate(
  id_accion: string,
  options?: {
    ttlSeconds?: number;
    metadata?: Record<string, any>;
    /** solo para DEV: si true, el backend puede devolver el OTP en la respuesta si no es production */
    returnOtpInResponse?: boolean;
    /** access token del usuario (Supabase) */
    token?: string;
  }
) {
  const { ttlSeconds, metadata, returnOtpInResponse, token } = options ?? {};
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
      ...(ttlSeconds ? { ttlSeconds } : {}),
      ...(metadata ? { metadata } : {}),
      ...(returnOtpInResponse ? { returnOtpInResponse: true } : {}),
    },
  });
}

/** Verificar OTP */
export async function otpVerify(
  id_accion: string,
  otp: string,
  token?: string
) {
  return await apiFetch<{ ok: boolean; reason?: string }>("/api/otp/verify", {
    method: "POST",
    headers: {
      ...withAuthHeader(token),
    },
    body: { id_accion, otp },
  });
}
