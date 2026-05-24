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
└── frontend/                       # Entorno del Cliente (Aplicación React SPA)
    ├── src/                        # Estructura interna de vistas y componentes
    ├── package.json                # Dependencias de interfaz y scripts de Vite
    ├── vite.config.ts              # Configuración de compilación y empaquetado Vite
    └── .gitignore                  # Políticas de exclusión de Git para Frontend