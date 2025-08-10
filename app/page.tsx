'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Building2, Search, Filter } from 'lucide-react'

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/panel')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to panel
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Consulta de Licitaciones SECOP
            </span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Sistema de búsqueda, ordenamiento y filtros combinados sobre datos de licitaciones públicas.
            Accede a información detallada y análisis avanzado de procesos de contratación.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Búsqueda Avanzada</h3>
            <p className="text-neutral-600">
              Encuentra licitaciones específicas con filtros múltiples y búsqueda por texto.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Filter className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Filtros Combinados</h3>
            <p className="text-neutral-600">
              Aplica múltiples filtros para refinar tus resultados de manera precisa.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Datos Completos</h3>
            <p className="text-neutral-600">
              Accede a información detallada de entidades, procesos y resultados.
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Acceso al Sistema</CardTitle>
              <CardDescription>
                Inicia sesión para acceder al panel de consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
