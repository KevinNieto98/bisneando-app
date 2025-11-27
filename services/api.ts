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

// --------- Colonias: activas con cobertura ----------------------------
export type Colonia = {
  id_colonia: number;
  nombre_colonia: string;
  is_active: boolean;
  tiene_cobertura: boolean;
  referencia: string | null;
  updated_at: string; // ISO
};

export async function fetchColoniasActivasConCobertura(options?: {
  /** filtro por nombre (contiene, case-insensitive) */
  search?: string;
  /** tamaño de página */
  limit?: number;
  /** desplazamiento para paginación */
  offset?: number;
  /** columna de orden (por defecto id_colonia) */
  orderBy?: "id_colonia" | "nombre_colonia" | "updated_at";
  /** dirección de orden */
  orderDir?: "asc" | "desc";
}) {
  const {
    search,
    limit,
    offset,
    orderBy = "id_colonia",
    orderDir = "asc",
  } = options ?? {};

  try {
    const qs = new URLSearchParams({
      is_active: "true",
      tiene_cobertura: "true",
      orderBy,
      orderDir,
    });

    if (typeof limit === "number") qs.set("limit", String(limit));
    if (typeof offset === "number") qs.set("offset", String(offset));
    if (search && search.trim()) qs.set("search", search.trim());

    // Asumiendo que tu backend expone /api/colonias y respeta estos query params
    // (p. ej., los traduces a filtros en tu route handler o en tu BFF).
    return await apiFetch<Colonia[]>(`/api/colonias?${qs.toString()}`);
  } catch (error) {
    console.error("Error fetchColoniasActivasConCobertura:", error);
    return [] as Colonia[];
  }
}


// --------- Direcciones: crear -----------------------------------------
export type DireccionRow = {
  id_direccion: number;
  uid: string;
  latitude: number;       // Postgres DECIMAL devuelto como number si cabe
  longitude: number;
  tipo_direccion: number;
  id_colonia: number | null;
  nombre_direccion: string | null;
  isPrincipal: boolean;
  referencia: string | null;
  created_at: string;     // ISO
  updated_at: string;     // ISO
};

export type CrearDireccionPayload = {
  uid: string;                       // requerido
  latitude: number;                  // requerido
  longitude: number;                 // requerido
  tipo_direccion: number;                 // requerido
  id_colonia?: number | null;
  nombre_direccion?: string | null;  // "Casa", "Oficina", ...
  isPrincipal?: boolean;             // default false
  referencia?: string | null;
  /** Si true (default), el backend desmarca otras principales del mismo uid */
  enforceSinglePrincipal?: boolean;
};

export type CrearDireccionResult =
  | { ok: true; direccion: DireccionRow }
  | { ok: false; message: string };

/**
 * Crea una dirección llamando a POST /api/direcciones
 * Si pasas un access token (Supabase) se enviará en Authorization: Bearer <token>
 */
export async function crearDireccion(
  payload: CrearDireccionPayload,
  token?: string
): Promise<CrearDireccionResult> {
  try {
    const data = await apiFetch<DireccionRow>("/api/direcciones", {
      method: "POST",
      headers: {
        ...withAuthHeader(token),
      },
      body: payload,
    });
    return { ok: true, direccion: data };
  } catch (error: any) {
    console.error("Error crearDireccion:", error);
    return { ok: false, message: error?.message ?? "No se pudo crear la dirección." };
  }
}

// --------- Direcciones: leer por uid -----------------------------------
export type Direccion = DireccionRow; // reutiliza el tipo ya definido más arriba

export async function fetchDireccionesByUid(
  uid: string,
  options?: {
    principalOnly?: boolean; // si true, solo devuelve la principal
    limit?: number;
    offset?: number;
    token?: string;          // access_token de Supabase (opcional)
  }
): Promise<Direccion[]> {
  const { principalOnly, limit, offset, token } = options ?? {};
  try {
    const qs = new URLSearchParams({ uid });
    if (typeof principalOnly === "boolean") qs.set("principalOnly", String(principalOnly));
    if (typeof limit === "number") qs.set("limit", String(limit));
    if (typeof offset === "number") qs.set("offset", String(offset));

    return await apiFetch<Direccion[]>(`/api/direcciones?${qs.toString()}`, {
      headers: { ...withAuthHeader(token) },
    });
  } catch (error) {
    console.error("Error fetchDireccionesByUid:", error);
    return [];
  }
}

/** Conveniencia: trae solo la dirección principal (o null si no existe) */
export async function fetchDireccionPrincipal(
  uid: string,
  token?: string
): Promise<Direccion | null> {
  try {
    const list = await fetchDireccionesByUid(uid, { principalOnly: true, token, limit: 1, offset: 0 });
    return list[0] ?? null;
  } catch (error) {
    console.error("Error fetchDireccionPrincipal:", error);
    return null;
  }
}


export async function eliminarDireccion(id: number) {
  const t0 = Date.now();
  const url = `/api/direcciones?id=${id}`;


  try {
    const resp = await apiFetch<{ message?: string; deletedId: number }>(url, { method: "DELETE" });
   
    return { ok: true as const, deletedId: resp.deletedId };
  } catch (error: any) {
   
    return { ok: false as const, message: error?.message ?? "No se pudo eliminar la dirección.", status: error?.status };
  }
}

// --------- Direcciones: leer por id_direccion --------------------------
export async function fetchDireccionById(
  id_direccion: number,
  token?: string
): Promise<Direccion | null> {
  if (!Number.isFinite(id_direccion) || id_direccion <= 0) {
    console.warn("fetchDireccionById: id_direccion inválido:", id_direccion);
    return null;
  }

  try {
    const data = await apiFetch<Direccion>(`/api/direcciones/${id_direccion}`, {
      headers: { ...withAuthHeader(token) },
    });
    return data ?? null;
  } catch (error: any) {
    // Si la API devuelve 404, normalizamos a null (no encontrada)
    if (error?.status === 404) return null;
    console.error("Error fetchDireccionById:", error);
    return null;
  }
}


// --------- Direcciones: actualizar (PUT) -------------------------------
export type ActualizarDireccionPayload = {
  id_direccion: number;             // requerido (se envía también en query ?id=)
  nombre_direccion?: string | null;
  latitude?: number;
  longitude?: number;
  referencia?: string | null;
  tipo_direccion?: number;
  id_colonia?: number | null;
};

export type ActualizarDireccionResult =
  | { ok: true; direccion: DireccionRow }
  | { ok: false; message: string; status?: number };

/**
 * Actualiza una dirección llamando a PUT /api/direcciones.
 * - Envía el id por query (?id=) y también en el body (por compatibilidad).
 * - Solo los campos presentes en el body serán actualizados por el backend.
 */
export async function actualizarDireccion(
  payload: ActualizarDireccionPayload,
  token?: string
): Promise<ActualizarDireccionResult> {
  try {
    if (!payload?.id_direccion || !Number.isFinite(payload.id_direccion)) {
      return { ok: false, message: "id_direccion inválido." };
    }

    const qs = new URLSearchParams({ id: String(payload.id_direccion) }).toString();

    const data = await apiFetch<DireccionRow>(`/api/direcciones?${qs}`, {
      method: "PUT",
      headers: { ...withAuthHeader(token) },
      body: payload, // el backend sólo actualizará las props definidas
    });

    return { ok: true, direccion: data };
  } catch (error: any) {
    console.error("Error actualizarDireccion:", error);
    return {
      ok: false,
      message: error?.message ?? "No se pudo actualizar la dirección.",
      status: error?.status,
    };
  }
}


// --------- Carrito: validar precios y stock ----------------------------
export type CartValidateItemInput = {
  id: number;           // id_producto en BD
  price: number;        // precio que trae el cliente
  quantity: number;     // cantidad solicitada
  title?: string;       // opcional (para logs o UI)
};

export type CartValidateOk = {
  id: number;
  status: "ok";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  message: string;
};

export type CartValidatePriceMismatch = {
  id: number;
  status: "price_mismatch";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  message: string;
};

export type CartValidateInsufficient = {
  id: number;
  status: "insufficient_stock";
  requestedQty: number;
  requestedPrice: number;
  nombre_producto: string;
  dbPrice: number;
  availableQty: number;
  suggestedQty: number;
  message: string;
};

export type CartValidateInactive = {
  id: number;
  status: "inactive";
  requestedQty: number;
  requestedPrice: number;
  message: string;
};

export type CartValidateNotFound = {
  id: number;
  status: "not_found";
  requestedQty: number;
  requestedPrice: number;
  message: string;
};

export type CartValidateItemResult =
  | CartValidateOk
  | CartValidatePriceMismatch
  | CartValidateInsufficient
  | CartValidateInactive
  | CartValidateNotFound;

export type CartValidateResponse = {
  ok: boolean; // true solo si todos los items están "ok"
  items: CartValidateItemResult[];
  totals: {
    serverSubtotal: number; // calculado con precio/cant de BD
  };
};

/**
 * Valida el carrito contra el backend.
 * - Envía { items } al endpoint POST /api/cart/validate
 * - Soporta Authorization opcional via Bearer token
 */
export async function validateCart(
  items: CartValidateItemInput[],
  token?: string
): Promise<CartValidateResponse> {
  try {
    // Sanitizar payload mínimo para evitar enviar props extra
    const payload = {
      items: items.map(({ id, price, quantity, title }) => ({
        id,
        price,
        quantity,
        ...(title ? { title } : {}),
      })),
    };

    const data = await apiFetch<CartValidateResponse>("/api/cart/validate", {
      method: "POST",
      headers: { ...withAuthHeader(token) },
      body: payload,
    });

    // Normalización defensiva por si el backend cambia algo menor
    return {
      ok: Boolean(data?.ok),
      items: Array.isArray(data?.items) ? data.items : [],
      totals: {
        serverSubtotal: Number(data?.totals?.serverSubtotal ?? 0),
      },
    };
  } catch (error: any) {
    console.error("Error validateCart:", error);
    // No reventar la app: devolver estructura conocida con ok=false
    return {
      ok: false,
      items: [],
      totals: { serverSubtotal: 0 },
    };
  }
}


// --------- Métodos de pago: activos ------------------------------------
export type MetodoPago = {
  id_metodo: number;
  nombre?: string;
  // otros campos que tengas...
  // activo?: boolean; // opcional si igual ya te llegan filtrados
};

export async function fetchMetodosActivos(): Promise<MetodoPago[]> {
  try {
    const res = await apiFetch<{ ok: boolean; items: MetodoPago[] }>("/api/metodos");
    if (res?.ok && Array.isArray(res.items)) return res.items;
    return [];
  } catch (error) {
    console.error("Error fetchMetodosActivos:", error);
    return [];
  }
}


// --------- Orders: crear (POST /api/orders) ----------------------------

export type OrderItemInput = {
  id_producto: number;
  qty: number;
  precio: number;
  id_bodega?: number | null;
};

export type CreateOrderPayload = {
  id_status: number;               // requerido
  items: OrderItemInput[];         // requerido

  // opcionales del header
  uid?: string;
  delivery?: number;
  isv?: number;
  ajuste?: number;
  num_factura?: string | null;
  rtn?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  tipo_dispositivo?: string | null;
  observacion?: string | null;
  usuario_actualiza?: string | null;

  // actividad inicial (opcional)
  actividad_observacion?: string | null;
};

export type CreateOrderOk = {
  message: string;                 // "Orden creada correctamente."
  reqId: string;
  data: {
    id_order: number;
    det_count: number;
    id_act?: number;
  };
};

export type CreateOrderErr = { message: string; reqId?: string };

export type CreateOrderResp = CreateOrderOk | CreateOrderErr;

/**
 * Crea una orden llamando a POST /api/orders
 * - Envía Authorization si pasas un token (opcional)
 */
export async function createOrderRequest(
  payload: CreateOrderPayload,
  token?: string
): Promise<CreateOrderResp> {
  try {

    console.log("payload:", payload);
    
    const data = await apiFetch<CreateOrderOk>("/api/orders", {
      method: "POST",
      headers: { ...withAuthHeader(token) },
      body: payload,
      timeoutMs: 15000, // opcional, un poco más alto por el insert múltiple
    });
    // Normalización defensiva
    if (data?.data?.id_order) return data;
    return { message: "Respuesta inesperada del servidor." };
  } catch (error: any) {
    // Mantén el contrato CreateOrderResp para que el front no truene
    return { message: error?.message ?? "No se pudo crear la orden." };
  }
}


export type OrderHeadApi = {
  id_order: number;
  uid: string;
  id_status: number | null;
  id_metodo: number | null;
  id_colonia: number | null;
  id_max_log: number | null;
  qty: number;
  sub_total: number;
  isv: number;
  delivery: number;
  ajuste: number;
  total: number;
  num_factura: string | null;
  rtn: string | null;
  latitud: string | null;
  longitud: string | null;
  observacion: string | null;
  usuario_actualiza: string | null;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
  status: string | null;
  nombre_colonia: string | null;
  usuario: string | null;
  metodo_pago: string | null;
};

type OrdersHeadApiResponse = {
  message: string;
  reqId?: string;
  data: OrderHeadApi[];
};

/**
 * Trae las órdenes (encabezados) de un usuario dado su uid.
 * Llama a GET /api/orders?uid=<uid>
 */
export async function fetchOrdersHeadByUid(
  uid: string,
  token?: string
): Promise<OrderHeadApi[]> {
  if (!uid || uid.trim() === "") {
    console.warn("fetchOrdersHeadByUid: uid vacío o inválido");
    throw new Error("Debe enviar un uid válido.");
  }

  try {
    const qs = new URLSearchParams({ uid }).toString();

    const res = await apiFetch<OrdersHeadApiResponse>(
      `/api/orders?${qs}`, // ✅ AQUÍ ESTABA EL BUG
      {
        method: "GET",
        headers: {
          ...withAuthHeader(token),
        },
      }
    );

    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetchOrdersHeadByUid:", error);
    return [];
  }
}

// --------- Orders: detalle por id (GET /api/orders/:id) ----------------

export type OrderDetailApi = {
  id_det: number;
  id_order: number;
  id_producto: number;
  qty: number;
  precio: number;
  id_bodega: number | null;
  sub_total: number | null;
  // campos enriquecidos
  nombre_producto: string | null;
  url_imagen: string | null;
};

export type OrderActivityApi = {
  id_act: number;
  id_order: number;
  id_status: number | null;
  fecha_actualizacion: string | null;
  usuario_actualiza: string | null;
  observacion: string | null;
  // campo enriquecido
  status: string | null;
};

export type OrderByIdApi = {
  head: OrderHeadApi;
  det: OrderDetailApi[];
  activity: OrderActivityApi[];
};

type OrderByIdApiResponse = {
  message: string;
  reqId?: string;
  data: OrderByIdApi | null;
};

/**
 * Trae el detalle completo de una orden:
 * head + det + activity.
 * Llama a GET /api/orders/:id_order
 */
export async function fetchOrderById(
  id_order: number,
  token?: string
): Promise<OrderByIdApi | null> {
  if (!Number.isFinite(id_order) || id_order <= 0) {
    console.warn("fetchOrderById: id_order inválido:", id_order);
    throw new Error("Debe enviar un id_order válido.");
  }

  try {
    const res = await apiFetch<OrderByIdApiResponse>(`/api/orden/${id_order}`, {
      method: "GET",
      headers: {
        ...withAuthHeader(token),
      },
    });

    return res.data ?? null;
  } catch (error: any) {
    // Si la API devuelve 404, normalizamos a null (orden no encontrada)
    if (error?.status === 404) {
      console.warn(`fetchOrderById: orden ${id_order} no encontrada`);
      return null;
    }

    console.error("Error fetchOrderById:", error);
    return null;
  }
}
