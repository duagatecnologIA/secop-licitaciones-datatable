'use client'

import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import LicitacionesTable from "@/components/licitaciones-table"
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export default function PanelPage() {
  const { user, signOut } = useAuth()

  return (
    <AuthGuard>
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header with user info and logout */}
          <header className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Consulta de Licitaciones SECOP
                  </span>
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                  Búsqueda, ordenamiento y filtros combinados sobre jbjy-vk9h.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </header>

          <LicitacionesTable 
            initialPage={1} 
            initialPageSize={50} 
            initialSort="nit_entidad" 
            initialOrder="asc" 
          />
        </div>
      </main>
    </AuthGuard>
  )
}
