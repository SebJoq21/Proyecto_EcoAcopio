describe('Registro de Pesajes en Balanza', () => {
  beforeEach(() => {
    // Iniciamos sesión programáticamente
    cy.login('admin@recicladora.com', 'admin123');
    cy.visit('/');
    
    // Esperamos a que la barra superior esté visible (lo que confirma que cargó el Dashboard)
    cy.get('.topbar').should('be.visible');

    // Navegamos al panel de Pesajes
    cy.contains('.nav-item', 'Registro de Pesaje').click();
  });

  it('debería cargar el formulario y el historial de últimos pesajes', () => {
    cy.contains('h1', 'Registro de Pesajes en Balanza').should('exist');
    cy.contains('.card-title', 'Nuevo Ticket de Operación').should('exist');
    cy.contains('.card-title', 'Últimos Pesajes del Turno Activo').should('exist');
  });

  it('debería crear un nuevo ticket de pesaje (compra) exitosamente', () => {
    // 1. Seleccionar un Proveedor
    cy.get('select').eq(0).should('not.be.disabled').select(1); // Selecciona el primer proveedor de la lista

    // 2. Filtrar Categoría para cargar los materiales reactivos
    cy.get('select').eq(1).should('not.be.disabled').select(1); // Selecciona la primera categoría

    // El dropdown de materiales específicos se habilita y cargamos el primero
    cy.get('select').eq(2).should('not.be.disabled').select(1);

    // 3. Completar Peso y Precio Unitario
    cy.get('input[type="number"]').eq(0).clear().type('120'); // 120 kg
    cy.get('input[type="number"]').eq(1).clear().type('2.20'); // S/. 2.20 por kg

    // Opcional: escribir observaciones
    cy.get('input[placeholder="Mermas, estado de humedad..."]').type('Prueba automatizada de báscula');

    // 4. Confirmar y registrar el ticket
    cy.get('button[type="submit"]').click();

    // Validar si hay un toast de error
    cy.get('body').then(($body) => {
      const errorToast = $body.find('.toast-error');
      if (errorToast.length > 0) {
        throw new Error("API Error: " + errorToast.text());
      }
    });

    // Validar toast de éxito
    cy.get('.toast-success').should('exist');

    // Validar que se liste en la tabla de Últimos Pesajes del Turno Activo
    cy.contains('td', '120.0 kg').should('exist');
    cy.contains('td', 'S/. 264.00').should('exist'); // 120 * 2.20 = 264.00
  });
});
