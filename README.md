# EcoAcopio ERP - Sistema de Gestión e Integridad Operativa

EcoAcopio es un sistema ERP transaccional ligero y Multi-Tenant diseñado específicamente para la formalización, trazabilidad e integridad financiera de centros de acopio de reciclaje. Este ecosistema está construido bajo estándares rigurosos de ingeniería de software, priorizando la seguridad de tipos, la inmutabilidad de periodos contables cerrados y una arquitectura altamente testeable (diseñada para pruebas unitarias e integración).

---

## Arquitectura del Software

El sistema implementa el **Patrón Repositorio combinado con una Capa de Servicios (Repository & Service Layer Pattern)**. Esta separación estricta de responsabilidades garantiza el desacoplamiento entre el protocolo de red (HTTP), las reglas de negocio del dominio y la persistencia de datos (PostgreSQL), facilitando la mantenibilidad y permitiendo una estrategia de pruebas de software automatizadas limpia mediante el aislamiento de componentes (*Mocking*).

### Flujo Arquitectónico de Datos:
1. **Capa de Rutas (`routes/`)**: Define los endpoints de la API y actúa como el mapa de entrada del sistema.
2. **Capa de Middlewares (`middlewares/`)**: Gestiona la seguridad (autenticación JWT), control Multi-Tenant (aislamiento por `id_empresa`) y la captura global de excepciones.
3. **Capa de Controladores (`controllers/`)**: Actúa como la interfaz de entrada HTTP. Extrae los parámetros, cuerpos de solicitudes (DTOs) y delega la ejecución a la capa de servicios.
4. **Capa de Servicios (`services/`)**: Representa el "Cerebro" del ERP. Aquí se ejecutan de manera agnóstica las validaciones y reglas lógicas del negocio (ej. restricciones de balanza, validación de estados de periodos contables).
5. **Capa de Repositorios (`repositories/`)**: Única capa con acceso directo al motor de persistencia a través de **Prisma ORM**. Abstrae las consultas SQL y transacciones atómicas complejas.

---

## Stack Tecnológico

### Backend
* **Entorno de Ejecución:** Node.js (LTS v20+)
* **Lenguaje:** TypeScript (Configuración Estricta) — Garantiza la mitigación de errores de tipo en tiempo de compilación, crucial para la integridad de datos de peso y transacciones financieras.
* **Framework Web:** Express.js — Servidor RESTful asíncrono de alto rendimiento.
* **ORM:** Prisma — Introspección nativa y generación automática de tipos en sincronía exacta con el motor de base de datos (*End-to-End Type Safety*).

### Base de Datos
* **Motor:** PostgreSQL — Sistema de gestión relacional robusto con soporte nativo para transacciones con propiedades ACID e índices compuestos de seguridad.

### Frontend
* **Librería Core:** React.js — Interfaz declarativa basada en componentes reactivos y reutilizables.
* **Bundler:** Vite — Entorno de desarrollo ultra-rápido y optimización avanzada de compilación estática.
* **Despliegue:** Vercel — Infraestructura de integración y despliegue continuo (CI/CD).

### Calidad y Pruebas (QA & Testing)
* **Framework de Testing:** Jest + Ts-Jest — Configurado para la ejecución automatizada de pruebas unitarias sobre los servicios lógicos de negocio y pruebas de integración sobre los endpoints del sistema.

---

## Estructura Completa del Proyecto

El repositorio está organizado de forma modular, manteniendo una separación limpia entre el ecosistema del servidor y el cliente:

```text
EcoAcopio/
├── backend/                        # Entorno del Servidor (API RESTful)
│   ├── prisma/                     # Dominio del ORM Prisma
│   │   └── schema.prisma           # Esquema de base de datos (Modelos y Relaciones)
│   │
│   ├── src/                        # Código Fuente TypeScript
│   │   ├── config/                 # Configuraciones Globales e Instancias (Singleton)
│   │   │   ├── env.ts              # Validación estricta de variables de entorno
│   │   │   ├── prisma.ts           # Cliente único de conexión a PostgreSQL
│   │   │   └── logger.ts           # Sistema centralizado de trazabilidad de errores
│   │   ├── controllers/            # Controladores HTTP (Extracción de Requests / Respuestas)
│   │   ├── middlewares/            # Filtros e Interceptores de Seguridad y Errores
│   │   ├── repositories/           # Capa de Acceso a Datos (Consultas Prisma Directas)
│   │   ├── routes/                 # Enrutamiento de Módulos (Definición de Endpoints)
│   │   ├── services/               # Capa Lógica (Cerebro del ERP / Reglas de Validación)
│   │   ├── types/                  # Contratos de Datos, Interfaces y DTOs
│   │   ├── utils/                  # Funciones de Soporte Criptográfico y Formatos
│   │   │   ├── bcrypt.util.ts      # Hash de contraseñas de seguridad
│   │   │   ├── jwt.util.ts         # Emisión y firma de credenciales efímeras
│   │   │   └── date.util.ts        # Control y parseo de marcas de tiempo contables
|   |   |
│   │   ├── app.ts                  # Inicialización y configuración de Express Middlewares
│   │   └── server.ts               # Punto de entrada de red (Bootstrapping del Servidor)
│   │
│   ├── .env                        # Variables de Entorno Locales (Ignorado en Git)
│   ├── .gitignore                  # Políticas de exclusión de Git para Backend
│   ├── package.json                # Declaración de dependencias y scripts de ejecución
│   └── tsconfig.json               # Configuración estricta del compilador TypeScript
│
├── frontend/
|   ├── public/                 <-- Archivos estáticos públicos
|   │   └── vite.svg
|   │
|   ├── src/                    <-- Todo el código fuente de React
|   │   ├── assets/             <-- Imágenes, íconos y estilos globales
|   │   │   ├── images/         <-- (Carpeta para futuros logos institucionales/imágenes)
|   │   │   └── styles/
|   │   │       └── index.css   <-- Punto de entrada de Tailwind CSS / Estilos base globales
|   │   │
|   │   ├── components/         <-- Componentes visuales reutilizables
|   │   │   ├── common/         <-- Elementos genéricos de la interfaz
|   │   │   │   ├── Button.tsx
|   │   │   │   ├── Input.tsx
|   │   │   │   ├── Modal.tsx
|   │   │   │   ├── Table.tsx
|   │   │   │   └── Spinner.tsx <-- Indicador visual de carga
|   │   │   └── layout/         <-- Piezas de la estructura visual principal
|   │   │       ├── Sidebar.tsx <-- Menú lateral de navegación
|   │   │       ├── Navbar.tsx  <-- Barra superior (usuario actual, botón cerrar sesión)
|   │   │       └── Footer.tsx  
|   │   │
|   │   ├── config/             <-- Configuraciones de librerías externas
|   │   │   ├── api.ts          <-- Instancia de Axios (cliente HTTP) con interceptores
|   │   │   └── env.ts          <-- Validación de variables de entorno de Vite
|   │   │
|   │   ├── contexts/           <-- Estado global de la aplicación (React Context)
|   │   │   └── AuthContext.tsx <-- Almacena la sesión del usuario y el JWT en memoria
|   │   │
|   │   ├── hooks/              <-- Custom Hooks de React
|   │   │   ├── useAuth.ts          <-- Facilita el acceso al AuthContext
|   │   │   └── useAxiosPrivate.ts  <-- Inyecta el token automáticamente en peticiones
|   │   │
|   │   ├── layouts/            <-- Estructuras "cascarón" de las vistas
|   │   │   ├── AuthLayout.tsx      <-- Diseño centrado para el Login (sin menú)
|   │   │   └── DashboardLayout.tsx <-- Diseño para el ERP (con Sidebar y Navbar integrados)
|   │   │
|   │   ├── pages/              <-- Vistas directas (Estructura aplanada y optimizada)
|   │   │   ├── LoginPage.tsx
|   │   │   ├── DashboardPage.tsx     <-- Pantalla principal (Resumen/Gráficos)
|   │   │   ├── EmpresasPage.tsx
|   │   │   ├── UsuariosPage.tsx
|   │   │   ├── CategoriasPage.tsx
|   │   │   ├── MaterialesPage.tsx
|   │   │   ├── ProveedoresPage.tsx
|   │   │   ├── InventarioPage.tsx    <-- Vista de solo lectura del stock actual
|   │   │   ├── PesajesPage.tsx       <-- Tabla histórica de pesajes
|   │   │   ├── NuevoPesajePage.tsx   <-- Formulario transaccional de la balanza
|   │   │   └── CierresPage.tsx
|   │   │
|   │   ├── routes/             <-- Lógica de navegación
|   │   │   ├── AppRouter.tsx       <-- Mapeo de URLs a Componentes de la carpeta pages/
|   │   │   └── ProtectedRoute.tsx  <-- "Guardián" que expulsa a usuarios sin sesión
|   │   │
|   │   ├── services/           <-- Archivos encargados de hacer el fetch al Backend
|   │   │   ├── auth.service.ts
|   │   │   ├── empresa.service.ts
|   │   │   ├── usuario.service.ts
|   │   │   ├── categoria.service.ts
|   │   │   ├── material.service.ts
|   │   │   ├── proveedor.service.ts
|   │   │   ├── inventario.service.ts
|   │   │   ├── pesaje.service.ts
|   │   │   └── cierre.service.ts
|   │   │
|   │   ├── types/              <-- Interfaces TypeScript (Espejo exacto de los DTOs del Backend)
|   │   │   ├── index.ts            <-- Archivo barril (facilita exportar todos los tipos)
|   │   │   ├── auth.types.ts
|   │   │   ├── empresa.types.ts
|   │   │   ├── usuario.types.ts
|   │   │   ├── categoria.types.ts
|   │   │   ├── material.types.ts
|   │   │   ├── proveedor.types.ts
|   │   │   ├── inventario.types.ts
|   │   │   ├── pesaje.types.ts
|   │   │   └── cierre.types.ts
|   │   │
|   │   ├── utils/              <-- Funciones utilitarias (Puras)
|   │   │   ├── formatCurrency.ts   <-- Para mostrar formato de moneda (S/.) correctamente
|   │   │   └── formatDate.ts       <-- Para formatear fechas (DD/MM/YYYY)
|   │   │
|   │   ├── App.tsx             <-- Componente raíz principal (Envuelve todo en Providers y Router)
|   │   ├── main.tsx            <-- Punto de entrada que inyecta React al DOM
|   │   └── vite-env.d.ts       <-- Definiciones de tipos globales de Vite
|   │
|   ├── .env                    <-- Variables de entorno locales (Ej: VITE_API_URL)
|   ├── .gitignore              <-- Reglas de exclusión para Git (ignora node_modules)
|   ├── eslint.config.js        <-- Reglas de Linter para código limpio
|   ├── index.html              <-- Plantilla HTML base donde se monta la SPA
|   ├── package.json            <-- Dependencias de npm y scripts
|   ├── postcss.config.js       <-- (Añadido) Configuración de PostCSS (requerido por Tailwind)
|   ├── tailwind.config.js      <-- (Añadido) Configuración de temas y colores de Tailwind CSS
|   ├── tsconfig.json           <-- Reglas base de TypeScript
|   ├── tsconfig.node.json      <-- Reglas TS para el entorno de Vite
|   └── vite.config.ts          <-- Configuración del bundler Vite

# INICIALIZAR EL BACKEND
1. Clona el repositorio, navega a la carpeta del backend y ejecuta el instalador de paquetes:
```bash
cd backend
npm install

2. Crea un archivo .env a partir del archivo .env.example y coloca las crendeciales **(CUIDADO CON SUBIR EL ARCHIVO .env)**