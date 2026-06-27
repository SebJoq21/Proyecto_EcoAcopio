describe('Escáner de Reciclabilidad IA', () => {
  beforeEach(() => {
    // Iniciamos sesión programáticamente como Admin
    cy.login('admin@recicladora.com', 'admin123');
    
    // Esperamos a que los requests de carga inicial terminen para garantizar estabilidad en el DOM
    cy.wait(['@meRequest', '@materialesRequest', '@proveedoresRequest', '@inventarioRequest']);

    // Esperamos a que cargue el dashboard
    cy.get('.topbar').should('be.visible');

    // Navegamos a la sección "Escáner IA"
    cy.contains('.nav-item', 'Escáner IA').click();

    // Esperamos a que la página cambie e imprima el título principal
    cy.contains('h1', 'Escáner de Reciclabilidad IA').should('be.visible');
  });

  it('debería cargar el panel del escáner y la guía rápida', () => {
    cy.contains('h1', 'Escáner de Reciclabilidad IA').should('be.visible');
    cy.contains('.card-title', 'Descripción del Objeto / Imagen').should('be.visible');
    cy.contains('.card-title', 'Guía Rápida de Materiales').should('be.visible');
  });

  it('debería mostrar error si se intenta analizar sin descripción ni imagen', () => {
    cy.contains('button', 'Analizar con IA').click();
    // Debe aparecer una notificación de error
    cy.get('.toast-error').should('be.visible').and('contain.text', 'Describe el objeto o sube una imagen.');
  });

  it('debería analizar un objeto por descripción y mostrar el resultado de la IA', () => {
    // Escribimos una descripción
    cy.get('textarea#ai-desc').type('Botella de plástico transparente de gaseosa');

    // Hacemos click en el botón de analizar
    cy.contains('button', 'Analizar con IA').click();

    // Validamos que se muestre el resultado mockeado
    cy.contains('div', 'Plástico PET').should('be.visible');
    cy.contains('.badge', 'Reciclable').should('be.visible');
    cy.contains('div', 'Confianza: 98%').should('be.visible');
    cy.contains('div', 'Retirar la tapa y la etiqueta').should('be.visible');
  });
});
