import './commands';

const safeParseFloat = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Variables para simular persistencia en memoria durante la sesión de pruebas
let mockCategorias = [
  { id_categoria: 'cat-uuid-001', nombre: 'Plásticos ♻️', fecha_creacion: '2026-06-26T20:00:00.000Z' },
  { id_categoria: 'cat-uuid-002', nombre: 'Metales 🔩', fecha_creacion: '2026-06-26T20:00:00.000Z' }
];

let mockMateriales = [
  {
    id_material: 'mat-uuid-101',
    etiqueta: 'PET-01',
    nombre: 'Plástico PET transparente',
    id_categoria: 'cat-uuid-001',
    categoria: { nombre: 'Plásticos ♻️' },
    precio_referencial_kg: 2.50,
    activo: true,
    emoji: '🥤'
  },
  {
    id_material: 'mat-uuid-102',
    etiqueta: 'AL-02',
    nombre: 'Latas de Aluminio',
    id_categoria: 'cat-uuid-002',
    categoria: { nombre: 'Metales 🔩' },
    precio_referencial_kg: 4.80,
    activo: true,
    emoji: '🥫'
  }
];

let mockProveedores = [
  {
    id_proveedor: 'prov-uuid-201',
    nombre_completo: 'Juan Pérez',
    numero_documento: '12345678',
    tipo_documento: 'DNI',
    telefono: '999888777',
    es_anonimo: false,
    total_transacciones: 12
  },
  {
    id_proveedor: 'prov-uuid-202',
    nombre_completo: 'María Gómez',
    numero_documento: '20888777666',
    tipo_documento: 'RUC',
    telefono: '999111222',
    es_anonimo: false,
    total_transacciones: 5
  }
];

let mockPesajes = [
  {
    id_pesaje: 'pesaje-uuid-301',
    tipo_movimiento: 'COMPRA',
    id_material: 'mat-uuid-101',
    id_proveedor: 'prov-uuid-201',
    peso_kg: 150.5,
    precio_unitario: 2.50,
    total_pagado: 376.25,
    fecha_creacion: '2026-06-26T21:00:00.000Z'
  }
];

beforeEach(() => {
  // Mock login and health
  cy.intercept('GET', '**/api/v1/health', { status: 'ok' }).as('health');
  
  cy.intercept('POST', '**/api/v1/auth/login', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        token: 'mock-jwt-token-12345',
        usuario: {
          id_usuario: 'user-uuid-111',
          rol: 'ADMIN',
          nombres: 'Admin',
          apellidos: 'Recicladora',
          email: req.body.email || 'admin@recicladora.com',
          id_empresa: 'empresa-uuid-999',
          activo: true
        }
      }
    });
  }).as('loginRequest');

  cy.intercept('GET', '**/api/v1/auth/me', {
    usuario: {
      id_usuario: 'user-uuid-111',
      rol: 'ADMIN',
      nombres: 'Admin',
      apellidos: 'Recicladora',
      email: 'admin@recicladora.com',
      id_empresa: 'empresa-uuid-999',
      activo: true
    }
  }).as('meRequest');

  // Mock categories
  cy.intercept('GET', '**/api/v1/categorias*', (req) => {
    req.reply(mockCategorias);
  }).as('categoriasRequest');

  cy.intercept('POST', '**/api/v1/categorias*', (req) => {
    const nueva = {
      id_categoria: 'cat-' + crypto.randomUUID(), // ✅ Solución SonarQube (ID Seguro)
      nombre: req.body.nombre,
      fecha_creacion: new Date().toISOString()
    };
    mockCategorias.push(nueva);
    req.reply({ statusCode: 201, body: nueva });
  }).as('crearCategoriaRequest');

  // Mock materials
  cy.intercept('GET', '**/api/v1/materiales*', (req) => {
    req.reply(mockMateriales);
  }).as('materialesRequest');

  cy.intercept('POST', '**/api/v1/materiales*', (req) => {
    const cat = mockCategorias.find(c => c.id_categoria === req.body.id_categoria) || { nombre: 'Otros' };
    const nuevo = {
      id_material: 'mat-' + crypto.randomUUID(), // ✅ Solución SonarQube (ID Seguro)
      etiqueta: req.body.etiqueta.toUpperCase(),
      nombre: req.body.nombre,
      id_categoria: req.body.id_categoria,
      categoria: { nombre: cat.nombre },
      precio_referencial_kg: safeParseFloat(req.body.precio_referencial_kg), // ✅ Solución SonarQube (Parse Seguro)
      activo: true,
      emoji: req.body.emoji || '📦'
    };
    mockMateriales.push(nuevo);
    req.reply({ statusCode: 201, body: nuevo });
  }).as('crearMaterialRequest');

  // Mock providers
  cy.intercept('GET', '**/api/v1/proveedores*', (req) => {
    req.reply(mockProveedores);
  }).as('proveedoresRequest');

  cy.intercept('POST', '**/api/v1/proveedores*', (req) => {
    const nuevo = {
      id_proveedor: 'prov-' + crypto.randomUUID(), // ✅ Solución SonarQube (ID Seguro)
      nombre_completo: req.body.nombre_completo,
      numero_documento: req.body.numero_documento,
      tipo_documento: req.body.tipo_documento,
      telefono: req.body.telefono,
      es_anonimo: req.body.es_anonimo || false,
      total_transacciones: 0
    };
    mockProveedores.push(nuevo);
    req.reply({ statusCode: 201, body: nuevo });
  }).as('crearProveedorRequest');

  // Mock inventory
  cy.intercept('GET', '**/api/v1/inventario*', (req) => {
    // Calculamos dinámicamente el stock sumando pesajes
    const stocks = {};
    mockMateriales.forEach(m => {
      stocks[m.id_material] = 0;
    });
    mockPesajes.forEach(p => {
      const peso = safeParseFloat(p.peso_kg); // ✅ Solución SonarQube (Parse Seguro)
      if (p.tipo_movimiento === 'COMPRA') {
        stocks[p.id_material] = (stocks[p.id_material] || 0) + peso;
      } else {
        stocks[p.id_material] = (stocks[p.id_material] || 0) - peso;
      }
    });

    const items = mockMateriales.map(m => ({
      id_material: m.id_material,
      stock_kg: Math.max(0, stocks[m.id_material] || 0)
    }));
    req.reply({ items });
  }).as('inventarioRequest');

  // Mock dashboard
  cy.intercept('GET', '**/api/v1/dashboard*', (req) => {
    const total = mockPesajes.reduce((acc, p) => acc + safeParseFloat(p.peso_kg), 0); // ✅ Solución SonarQube
    req.reply({
      total_stock: total,
      transacciones_mes: mockPesajes.length,
      alertas: [],
      items: mockMateriales.map(m => ({
        id_material: m.id_material,
        stock_kg: 100
      }))
    });
  }).as('dashboardRequest');

  // Mock pesajes
  cy.intercept('GET', '**/api/v1/pesajes*', (req) => {
    req.reply(mockPesajes);
  }).as('pesajesRequest');

  cy.intercept('POST', '**/api/v1/pesajes*', (req) => {
    const nuevo = {
      id_pesaje: 'pesaje-' + crypto.randomUUID(), // ✅ Solución SonarQube (ID Seguro)
      tipo_movimiento: req.body.tipo_movimiento,
      id_material: req.body.id_material,
      id_proveedor: req.body.id_proveedor,
      peso_kg: safeParseFloat(req.body.peso_kg), // ✅ Solución SonarQube (Parse Seguro)
      precio_unitario: safeParseFloat(req.body.precio_unitario), // ✅ Solución SonarQube (Parse Seguro)
      total_pagado: safeParseFloat(req.body.total_pagado), // ✅ Solución SonarQube (Parse Seguro)
      fecha_creacion: new Date().toISOString()
    };
    mockPesajes.push(nuevo);
    req.reply({ statusCode: 201, body: nuevo });
  }).as('crearPesajeRequest');

  // Mock scanner (IA)
  cy.intercept('POST', '**/api/v1/scanner/analizar*', {
    material: 'Plástico PET',
    emoji: '🥤',
    descripcion: 'Botella de plástico transparente de bebida, material 100% reciclable.',
    reciclable: true,
    confianza: 98,
    instrucciones: 'Retirar la tapa y la etiqueta antes de depositar en el contenedor verde.'
  }).as('analizarIARequest');
});