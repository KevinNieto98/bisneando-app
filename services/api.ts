const API_BASE = process.env.EXPO_PUBLIC_API_URL

export async function fetchCategorias() {
  try {
    const res = await fetch(`${API_BASE}/api/categorias`)
    if (!res.ok) throw new Error("Error al obtener categorías")

    return await res.json()
  } catch (error) {
    console.error("Error fetchCategorias:", error)
    return []
  }
}

export async function fetchActivePortadas() {
  try {
    const res = await fetch(`${API_BASE}/api/portadas`)
    if (!res.ok) throw new Error("Error al obtener portadas activas")

    return await res.json()
  } catch (error) {
    console.error("Error fetchActivePortadas:", error)
    return []
  }
}

export async function fetchProductosDestacados() {
  try {
    const res = await fetch(`${API_BASE}/api/productos/?onlyActive=true&orderBy=fecha_creacion&orderDir=desc&limit=10`)
    if (!res.ok) throw new Error("Error al obtener productos")

    return await res.json()
  } catch (error) {
    console.error("Error fetchProductosDestacados:", error)
    return []
  }
}


export async function fetchProductoById(id: number) {
  try {
    const res = await fetch(`${API_BASE}/api/productos/${id}`);
    if (!res.ok) throw new Error("Error al obtener producto");
    return await res.json();
  } catch (error) {
    console.error("fetchProductoById:", error);
    return null;
  }
}