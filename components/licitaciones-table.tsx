"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown, RotateCcw, Copy, Check } from "lucide-react"
import { MultiSelect } from "./multi-select"

type Licitacion = {
  nit_entidad?: string
  departamento?: string
  ciudad?: string
  proceso_de_compra?: string
  estado_contrato?: string
  valor_del_contrato?: string | number
  proveedor_adjudicado?: string
  urlproceso?: string | { url?: string }
}

type ApiResponse = {
  data: Licitacion[]
  total: number
  filtered: number
  page: number
  pageSize: number
}

type OrderDir = "asc" | "desc"

type Props = {
  initialPage?: number
  initialPageSize?: number
  initialSort?: keyof Licitacion | ""
  initialOrder?: OrderDir
}

const COLUMNS: { key: keyof Licitacion; label: string; hideOnSm?: boolean }[] = [
  { key: "nit_entidad", label: "NIT Entidad" },
  { key: "departamento", label: "Departamento", hideOnSm: true },
  { key: "ciudad", label: "Ciudad", hideOnSm: true },
  { key: "proceso_de_compra", label: "Proceso de Compra" },
  { key: "estado_contrato", label: "Estado Contrato", hideOnSm: true },
  { key: "valor_del_contrato", label: "Valor del Contrato" },
  { key: "proveedor_adjudicado", label: "Proveedor" },
  { key: "urlproceso", label: "Enlace" },
]

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

type Facets = {
  departamentos: string[]
  ciudades: string[]
  estados: string[]
  procesos: string[]
}

function CopyableText({
  value,
  display,
  maxChars = 24,
  label = "texto",
  truncate = true,
  className = "",
}: {
  value?: string
  display?: string
  maxChars?: number
  label?: string
  truncate?: boolean
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const shown = !display
    ? display
    : truncate && display.length > maxChars
      ? display.slice(0, Math.max(0, maxChars - 1)) + "…"
      : display

  async function onCopy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "inline-flex max-w-full items-center gap-1 text-sky-700 hover:text-sky-900",
              "transition-colors",
              className,
            )}
            title={"Copiar " + label}
            aria-label={"Copiar " + label}
          >
            <span className="truncate">{shown ?? "-"}</span>
            {value ? copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" /> : null}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{copied ? "¡Copiado!" : "Copiar " + label}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function LicitacionesTable(
  { initialPage = 1, initialPageSize = 50, initialSort = "nit_entidad", initialOrder = "asc" }: Props = {
    initialPage: 1,
    initialPageSize: 50,
    initialSort: "nit_entidad",
    initialOrder: "asc",
  },
) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sort, setSort] = useState<keyof Licitacion | "">(initialSort)
  const [order, setOrder] = useState<OrderDir>(initialOrder)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Licitacion[]>([])
  const [total, setTotal] = useState(0)
  const [filtered, setFiltered] = useState(0)

  const [facets, setFacets] = useState<Facets | null>(null)
  const [facetsLoading, setFacetsLoading] = useState(false)
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [ciudades, setCiudades] = useState<string[]>([])
  const [estados, setEstados] = useState<string[]>([])
  const [proveedor, setProveedor] = useState("")
  const [proveedorDebounced, setProveedorDebounced] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setProveedorDebounced(proveedor), 500)
    return () => clearTimeout(t)
  }, [proveedor])

  // Load facets
  useEffect(() => {
    let aborted = false
    async function loadFacets() {
      try {
        setFacetsLoading(true)
        const res = await fetch("/api/licitaciones/facets", { cache: "no-store" })
        if (!res.ok) throw new Error(await res.text())
        const json: Facets = await res.json()
        if (aborted) return
        setFacets(json)
      } catch (e) {
        console.error("Error cargando facetas:", e)
      } finally {
        if (!aborted) setFacetsLoading(false)
      }
    }
    loadFacets()
    return () => {
      aborted = true
    }
  }, [])

  // Fetch table data
  useEffect(() => {
    let aborted = false
    const controller = new AbortController()
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          sort: sort ? String(sort) : "",
          order,
        })

        if (proveedorDebounced) params.set("proveedor_adjudicado", proveedorDebounced)
        departamentos.forEach((d) => params.append("departamento", d))
        ciudades.forEach((c) => params.append("ciudad", c))
        estados.forEach((e) => params.append("estado_contrato", e))

        const res = await fetch(`/api/licitaciones?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        if (!res.ok) throw new Error(await res.text())
        const json: ApiResponse = await res.json()
        if (aborted) return
        setRows(json.data)
        setTotal(json.total)
        setFiltered(json.filtered)
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Error desconocido")
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => {
      aborted = true
      controller.abort()
    }
  }, [
    page,
    pageSize,
    sort,
    order,
    proveedorDebounced,
    departamentos,
    ciudades,
    estados,
  ])

  useEffect(() => {
    setPage(1)
  }, [
    pageSize,
    sort,
    order,
    proveedorDebounced,
    departamentos,
    ciudades,
    estados
  ])

  const totalPages = useMemo(() => {
    const n = filtered || 0
    return n > 0 ? Math.ceil(n / pageSize) : 1
  }, [filtered, pageSize])

  const toggleSort = (key: keyof Licitacion) => {
    if (sort !== key) {
      setSort(key)
      setOrder("asc")
    } else {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }
  }

  const clearFilters = () => {
    setProveedor("")
    setDepartamentos([])
    setCiudades([])
    setEstados([])
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur-sm shadow-sm",
        "ring-1 ring-black/5",
      )}
    >
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-9">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Filas</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[92px] rounded-lg border-neutral-200 focus-visible:ring-2 focus-visible:ring-sky-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MultiSelect
              label="Departamento"
              placeholder={facetsLoading ? "Cargando..." : "Selecciona departamento(s)"}
              options={facets?.departamentos ?? []}
              selected={departamentos}
              onChange={setDepartamentos}
            />
            <MultiSelect
              label="Ciudad"
              placeholder={facetsLoading ? "Cargando..." : "Selecciona ciudad(es)"}
              options={facets?.ciudades ?? []}
              selected={ciudades}
              onChange={setCiudades}
            />
            <MultiSelect
              label="Estado del contrato"
              placeholder={facetsLoading ? "Cargando..." : "Selecciona estado(s)"}
              options={facets?.estados ?? []}
              selected={estados}
              onChange={setEstados}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-800">Proveedor adjudicado</label>
              <Input
                placeholder="Nombre o parte del nombre"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="rounded-lg border-neutral-200 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-sky-500/30"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 lg:col-span-3">
          <div className="flex items-center justify-end gap-3">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                {"Aplicando filtros..."}
              </span>
            ) : (
              <span className="text-sm text-neutral-500">{filtered.toLocaleString("es-CO")} resultados</span>
            )}
          </div>
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              className="gap-2 rounded-lg border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              onClick={clearFilters}
            >
              <RotateCcw className="h-4 w-4 text-sky-700" />
              Restablecer filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
              {COLUMNS.map((c) => {
                const isActive = sort === c.key
                return (
                  <TableHead
                    key={String(c.key)}
                    className={cn(
                      "whitespace-nowrap px-3 py-3 text-left text-sm font-medium text-neutral-700",
                      c.hideOnSm ? "hidden md:table-cell" : "",
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort(c.key)}
                      className="gap-1 px-0 text-neutral-700 hover:bg-transparent hover:text-neutral-900"
                    >
                      <span>{c.label}</span>
                      <ArrowUpDown className={cn("ml-1 h-3.5 w-3.5", isActive ? "text-sky-700" : "text-neutral-400")} />
                    </Button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow className="border-b border-neutral-200">
                <TableCell colSpan={COLUMNS.length} className="px-3 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </TableCell>
              </TableRow>
            ) : loading && rows.length === 0 ? (
              Array.from({ length: Math.min(5, pageSize) }).map((_, i) => (
                <TableRow
                  key={i}
                  className={cn(
                    "border-b border-neutral-200",
                    i % 2 === 0 ? "bg-white" : "bg-neutral-50",
                    "hover:bg-sky-50",
                  )}
                >
                  {COLUMNS.map((c, j) => (
                    <TableCell key={j} className={cn("px-3 py-3", c.hideOnSm ? "hidden md:table-cell" : "")}>
                      <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="border-b border-neutral-200">
                <TableCell colSpan={COLUMNS.length} className="px-3 py-3">
                  <p className="text-sm text-neutral-500">No se encontraron resultados.</p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => {
                const url = typeof r.urlproceso === "object" ? r.urlproceso?.url : (r.urlproceso as string | undefined)
                return (
                  <TableRow
                    key={idx}
                    className={cn(
                      "border-b border-neutral-200",
                      idx % 2 === 0 ? "bg-white" : "bg-neutral-50",
                      "hover:bg-sky-50",
                    )}
                  >
                    <TableCell className="whitespace-nowrap px-3 py-3 font-normal">
                      <CopyableText
                        value={r.nit_entidad ?? ""}
                        display={r.nit_entidad ?? "-"}
                        label="NIT"
                        truncate={false}
                        className="align-middle"
                      />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap px-3 py-3 font-normal md:table-cell">
                      {r.departamento ?? "-"}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap px-3 py-3 font-normal md:table-cell">
                      {r.ciudad ?? "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 font-normal">
                      {r.proceso_de_compra ?? "-"}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap px-3 py-3 font-normal md:table-cell">
                      {r.estado_contrato ?? "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 font-normal">
                      {r.valor_del_contrato
                        ? currency.format(
                            typeof r.valor_del_contrato === "string"
                              ? Number(r.valor_del_contrato)
                              : r.valor_del_contrato,
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 font-normal">
                      <CopyableText
                        value={r.proveedor_adjudicado ?? ""}
                        display={r.proveedor_adjudicado ?? "-"}
                        maxChars={24}
                        label="proveedor"
                        truncate
                        className="max-w-[240px] align-middle"
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3 font-normal">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 underline underline-offset-2 hover:text-sky-900"
                        >
                          Ver
                          <span className="sr-only">{" enlace del proceso"}</span>
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-3 p-4 md:flex-row">
        <p className="text-sm text-neutral-500">
          Mostrando{" "}
          <strong className="text-neutral-900">
            {rows.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered)}
          </strong>{" "}
          de <strong className="text-neutral-900">{filtered.toLocaleString("es-CO")}</strong> registros
          {filtered !== total ? (
            <span className="text-neutral-500"> (de {total.toLocaleString("es-CO")} totales)</span>
          ) : null}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className={cn(
              "gap-1 rounded-lg border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
              "disabled:opacity-60",
            )}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="min-w-[80px] text-center text-sm text-neutral-900">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className={cn(
              "gap-1 rounded-lg border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
              "disabled:opacity-60",
            )}
            aria-label="Página siguiente"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
