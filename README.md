# 🏛️ SECOP Consultas - Sistema de Licitaciones Públicas

Sistema web para consulta y análisis de licitaciones públicas del SECOP (Sistema Electrónico de Contratación Pública) de Colombia.

## ✨ Características

- **🔐 Autenticación Segura**: Sistema de login con Supabase
- **📊 Tabla de Licitaciones**: Visualización de datos con paginación
- **🔍 Búsqueda Avanzada**: Filtros múltiples y búsqueda por texto
- **📱 Responsive**: Diseño adaptativo para todos los dispositivos
- **🎨 UI Moderna**: Interfaz atractiva con animaciones y gradientes

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 15.2.4, TypeScript, React
- **Estilos**: Tailwind CSS v4
- **Autenticación**: Supabase
- **UI Components**: Radix UI, Lucide React
- **Formularios**: React Hook Form, Zod
- **Gestión de Estado**: React Context API

## 📋 Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm
- Cuenta en Supabase

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd secop-consultas-next
```

### 2. Instalar dependencias
```bash
pnpm install
# o
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publica_de_supabase
```

### 4. Ejecutar en desarrollo
```bash
pnpm dev
# o
npm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

```
secop-consultas-next/
├── app/                    # App Router de Next.js
│   ├── api/               # Endpoints de API
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   ├── login/             # Página de autenticación
│   └── panel/             # Panel principal (protegido)
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes de UI base
│   ├── AuthProvider.tsx   # Proveedor de autenticación
│   ├── AuthGuard.tsx      # Guardia de rutas protegidas
│   └── licitaciones-table.tsx # Tabla de licitaciones
├── hooks/                  # Hooks personalizados
│   └── useAuth.ts         # Hook de autenticación
├── lib/                    # Utilidades y clientes
│   └── supabaseAuthClient.ts # Cliente de Supabase
└── README.md              # Este archivo
```

## 🔐 Autenticación

El sistema utiliza Supabase para la autenticación de usuarios:

- **Login**: Email y contraseña
- **Sesiones persistentes**: Las sesiones se mantienen entre recargas
- **Rutas protegidas**: Solo usuarios autenticados pueden acceder al panel
- **Logout**: Cierre de sesión seguro

## 📱 Páginas Principales

### 🏠 Página de Inicio (`/`)
- Landing page pública
- Información sobre el sistema
- Botón de acceso al login

### 🔑 Login (`/login`)
- Formulario de autenticación
- Validación de credenciales
- Redirección automática al panel

### 📊 Panel (`/panel`)
- Tabla de licitaciones con datos reales
- Filtros y búsqueda avanzada
- Información del usuario logueado
- Botón de logout

## 🎨 Personalización

### Colores del Tema
El sistema utiliza una paleta de colores consistente:
- **Primario**: `sky-500`, `blue-600`, `violet-600`
- **Neutral**: `neutral-50`, `neutral-900`
- **Fondo**: Gradientes suaves y transparencias

### Animaciones
- Elementos flotantes en el fondo del login
- Transiciones suaves en botones e inputs
- Efectos hover y focus

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros proveedores
- Netlify
- Railway
- Heroku

## 🔧 Scripts Disponibles

```bash
pnpm dev          # Desarrollo local
pnpm build        # Construir para producción
pnpm start        # Iniciar servidor de producción
pnpm lint         # Verificar código
pnpm type-check   # Verificar tipos TypeScript
```

## 📊 API y Datos

El sistema consume datos de licitaciones públicas a través de:
- **Dataset**: jbjy-vk9h (Licitaciones SECOP)
- **Endpoint**: `/api/licitaciones`
- **Filtros**: Entidad, estado, fecha, valor, etc.

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 🔄 Historial de Versiones

- **v1.0.0**: Implementación inicial con autenticación y tabla de licitaciones
- **v1.1.0**: Mejoras en UI/UX y diseño responsive
- **v1.2.0**: Sistema de filtros avanzados y búsqueda

---

**Desarrollado con ❤️ para la consulta eficiente de licitaciones públicas**
