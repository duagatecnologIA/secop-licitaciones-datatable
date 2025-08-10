import "server-only"
import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.datos.gov.co/resource/jbjy-vk9h.json"
const APP_TOKEN = process.env.SOCRATA_APP_TOKEN || ""

const headers: HeadersInit = {
  Accept: "application/json",
  ...(APP_TOKEN ? { "X-App-Token": APP_TOKEN } : {}),
}

async function fetchDistinct(field: string) {
  const params = new URLSearchParams()
  params.set("$select", `${field}`)
  params.set("$group", `${field}`)
  params.set("$order", `${field} ASC`)
  params.set("$limit", "50000")
  const res = await fetch(`${API_URL}?${params.toString()}`, { headers, cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  const json = (await res.json()) as Record<string, string>[]
  const values = json
    .map((row) => row[field])
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
    .map((v) => String(v))
  return Array.from(new Set(values))
}

export async function GET() {
  try {
    const [departamentos, ciudades, estados, procesos] = await Promise.all([
      fetchDistinct("departamento"),
      fetchDistinct("ciudad"),
      fetchDistinct("estado_contrato"),
      fetchDistinct("proceso_de_compra"),
    ])

    return NextResponse.json({
      departamentos,
      ciudades,
      estados,
      procesos,
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Error al cargar facetas", detail: e?.message || String(e) }, { status: 500 })
  }
}
