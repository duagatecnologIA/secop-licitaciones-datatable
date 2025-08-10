import "server-only"
import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.datos.gov.co/resource/jbjy-vk9h.json"
const APP_TOKEN = process.env.SOCRATA_APP_TOKEN || ""

const ALLOWED_SORT = new Set([
  "nit_entidad",
  "departamento",
  "ciudad",
  "proceso_de_compra",
  "estado_contrato",
  "valor_del_contrato",
  "proveedor_adjudicado",
  "urlproceso",
])

function esc(input: string) {
  return input.replace(/'/g, "''").trim()
}

function inList(field: string, values: string[]) {
  const safe = values
    .map((v) => esc(v))
    .filter((v) => v.length > 0)
    .map((v) => `'${v}'`)
  if (safe.length === 0) return ""
  return `${field} IN (${safe.join(",")})`
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sp = url.searchParams

    // Pagination
    const page = Math.max(Number.parseInt(sp.get("page") || "1", 10), 1)
    const pageSize = Math.min(Math.max(Number.parseInt(sp.get("pageSize") || "50", 10), 1), 1000)
    const offset = (page - 1) * pageSize

    // Sorting
    const sort = (sp.get("sort") || "").trim()
    const order = (sp.get("order") || "asc").toLowerCase() === "desc" ? "DESC" : "ASC"

    // Global search (optional)
    const search = (sp.get("search") || "").trim()

    // Facet filters (multi)
    const departamentos = sp.getAll("departamento")
    const ciudades = sp.getAll("ciudad")
    const estados = sp.getAll("estado_contrato")
    const procesos = sp.getAll("proceso_de_compra")

    // Text filters
    const nit = (sp.get("nit_entidad") || "").trim()
    const proveedor = (sp.get("proveedor_adjudicado") || "").trim()

    // Build SoQL
    const params = new URLSearchParams()
    params.set("$limit", String(pageSize))
    params.set("$offset", String(offset))

    if (sort && ALLOWED_SORT.has(sort)) {
      params.set("$order", `${sort} ${order}`)
    }

    const conditions: string[] = []

    // Multi-select equals
    const depClause = inList("departamento", departamentos)
    if (depClause) conditions.push(depClause)
    const cityClause = inList("ciudad", ciudades)
    if (cityClause) conditions.push(cityClause)
    const estadoClause = inList("estado_contrato", estados)
    if (estadoClause) conditions.push(estadoClause)
    const procesoClause = inList("proceso_de_compra", procesos)
    if (procesoClause) conditions.push(procesoClause)

    // Text contains
    if (nit) conditions.push(`upper(nit_entidad) like upper('%${esc(nit)}%')`)
    if (proveedor) conditions.push(`upper(proveedor_adjudicado) like upper('%${esc(proveedor)}%')`)

    // Global search across selected columns
    if (search) {
      const q = esc(search)
      const ors = [
        `upper(nit_entidad) like upper('%${q}%')`,
        `upper(departamento) like upper('%${q}%')`,
        `upper(ciudad) like upper('%${q}%')`,
        `upper(proceso_de_compra) like upper('%${q}%')`,
        `upper(estado_contrato) like upper('%${q}%')`,
        `upper(proveedor_adjudicado) like upper('%${q}%')`,
      ]
      conditions.push(`(${ors.join(" OR ")})`)
    }

    if (conditions.length > 0) {
      params.set("$where", conditions.join(" AND "))
    }

    const headers: HeadersInit = {
      Accept: "application/json",
      ...(APP_TOKEN ? { "X-App-Token": APP_TOKEN } : {}),
    }

    // Fetch data
    const dataRes = await fetch(`${API_URL}?${params.toString()}`, { headers, cache: "no-store" })
    if (!dataRes.ok) {
      const txt = await dataRes.text()
      return NextResponse.json({ error: "Error al obtener datos", detail: txt }, { status: 502 })
    }
    const data = await dataRes.json()

    // Total count (unfiltered)
    const totalRes = await fetch(`${API_URL}?$select=count(1) as c`, { headers, cache: "no-store" })
    const totalJson = await totalRes.json()
    const total = Number.parseInt((totalJson?.[0]?.c as string) || "0", 10)

    // Filtered count
    let filtered = total
    if (conditions.length > 0) {
      const countParams = new URLSearchParams()
      countParams.set("$select", "count(1) as c")
      countParams.set("$where", conditions.join(" AND "))
      const filterRes = await fetch(`${API_URL}?${countParams.toString()}`, { headers, cache: "no-store" })
      const filterJson = await filterRes.json()
      filtered = Number.parseInt((filterJson?.[0]?.c as string) || "0", 10)
    }

    return NextResponse.json({ data, total, filtered, page, pageSize })
  } catch (err: any) {
    return NextResponse.json({ error: "Error del servidor", detail: err?.message || String(err) }, { status: 500 })
  }
}
