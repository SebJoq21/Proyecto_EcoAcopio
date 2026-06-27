describe('Página de Destino (Landing Page)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debería mostrar el título principal, las características y los pasos de flujo', () => {
    cy.contains('.landing-logo-text', 'EcoAcopio').should('exist');
    cy.contains('h1', 'Transformamos').should('exist');
    cy.contains('h2', 'Todo lo que necesitas').should('exist');
    cy.contains('h2', 'Tres pasos para').should('exist');
    cy.contains('h2', 'Preguntas frecuentes').should('exist');
  });

  it('debería permitir abrir y cerrar las preguntas frecuentes (FAQs)', () => {
    // La respuesta no debe estar visible inicialmente
    cy.contains('EcoAcopio es un sistema de gestión integral').should('not.be.visible');

    // Hacemos click en la primera pregunta
    cy.contains('¿Qué es EcoAcopio?').click();

    // Ahora la respuesta debería ser visible
    cy.contains('EcoAcopio es un sistema de gestión integral').should('be.visible');

    // Hacemos click otra vez para cerrarla
    cy.contains('¿Qué es EcoAcopio?').click();
    cy.contains('EcoAcopio es un sistema de gestión integral').should('not.be.visible');
  });

  it('debería abrir el modal de inicio de sesión al hacer clic en Iniciar Sesión', () => {
    cy.contains('button', 'Iniciar Sesión').click();
    // Validamos que se muestre el formulario de autenticación
    cy.get('form').should('be.visible');
    cy.contains('button', 'Ingresar al Sistema').should('be.visible');
  });
});
