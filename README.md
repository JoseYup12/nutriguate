# 🥗 NutriGuate

**Tu plan nutricional personalizado basado en la comida guatemalteca.**

App web construida con React + Vite + TypeScript + Tailwind CSS + shadcn/ui.

---

## 🚀 Cómo correr localmente

### Requisitos
- **Node.js** v18 o superior → https://nodejs.org
- **npm** (viene con Node) o **yarn**

### Pasos

```bash
# 1. Entrar a la carpeta del proyecto
cd nutriguate-local

# 2. Instalar dependencias
npm install

# 3. Correr en modo desarrollo
npm run dev
```

El navegador se abrirá automáticamente en: **http://localhost:3000**

---

## 📁 Estructura del proyecto

```
nutriguate-local/
├── public/              # Archivos estáticos (favicon, robots.txt)
├── src/
│   ├── assets/          # Imágenes (hero, testimoniales, etc.)
│   ├── components/
│   │   ├── screens/     # Pantallas principales de la app
│   │   │   ├── LandingPage.tsx
│   │   │   ├── VSLPage.tsx
│   │   │   ├── FormularioDiagnostico.tsx
│   │   │   ├── GeneratingScreen.tsx
│   │   │   ├── InsightScreen.tsx
│   │   │   ├── PaywallPlans.tsx
│   │   │   └── Dashboard.tsx
│   │   └── ui/          # Componentes shadcn/ui
│   ├── hooks/           # React hooks personalizados
│   ├── lib/             # Utilidades (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx    # Manejo de pantallas (router interno)
│   │   └── NotFound.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css        # Variables CSS + Tailwind
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🖥️ Flujo de pantallas

```
LandingPage → VSLPage → FormularioDiagnostico → GeneratingScreen → InsightScreen → PaywallPlans → Dashboard
```

## 🛠️ Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (localhost:3000) |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | Revisar errores de código |

---

## 🎨 Stack tecnológico

- **React 18** + **TypeScript**
- **Vite 5** (bundler ultra-rápido)
- **Tailwind CSS 3**
- **shadcn/ui** (componentes de UI)
- **React Router DOM** (navegación)
- **TanStack Query** (estado del servidor)
- **React Hook Form** + **Zod** (formularios y validación)
- **Recharts** (gráficas del dashboard)
- **Lucide React** (iconos)
