"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiSelectProps = {
  label?: string
  placeholder?: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
  emptyText?: string
}

export function MultiSelect({
  label,
  placeholder = "Selecciona...",
  options,
  selected,
  onChange,
  className,
  emptyText = "Sin opciones",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter((opt) => (opt || "").toLowerCase().includes(q))
  }, [options, query])

  const toggle = (val: string) => {
    const exists = selected.includes(val)
    if (exists) onChange(selected.filter((v) => v !== val))
    else onChange([...selected, val])
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div className={cn("w-full", className)}>
      {label ? <label className="mb-1 block text-sm font-medium text-neutral-800">{label}</label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between rounded-lg border border-neutral-200 bg-white text-neutral-800",
              "hover:bg-white hover:border-neutral-300",
              "focus-visible:ring-2 focus-visible:ring-sky-500/30",
            )}
          >
            <span className="truncate text-sm">
              {selected.length > 0 ? `${selected.length} seleccionado${selected.length > 1 ? "s" : ""}` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-neutral-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
          sideOffset={6}
          collisionPadding={8}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 p-2">
            <div className="flex flex-wrap gap-1">
              {selected.slice(0, 4).map((v) => (
                <Badge key={v} variant="secondary" className="flex items-center gap-1">
                  <span className="max-w-[140px] truncate">{v}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(v)
                    }}
                    aria-label={"Quitar " + v}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
              {selected.length > 4 ? <Badge variant="secondary">+{selected.length - 4}</Badge> : null}
            </div>
            {selected.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 px-2 text-xs text-neutral-600">
                Limpiar
              </Button>
            ) : null}
          </div>
          <Command shouldFilter={false}>
            <CommandInput placeholder="Buscar..." value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filtered.map((opt) => (
                  <CommandItem key={opt} value={opt} onSelect={() => toggle(opt)} className="flex items-center gap-2">
                    <Checkbox checked={selected.includes(opt)} aria-label={"Seleccionar " + opt} />
                    <span className="flex-1 truncate">{opt || "-"}</span>
                    {selected.includes(opt) ? <Check className="h-4 w-4 text-sky-600" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
