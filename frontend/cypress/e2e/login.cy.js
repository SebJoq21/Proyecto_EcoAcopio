describe('Flujo de Autenticación (Login)', () => {
  beforeEach(() => {
    cy.visit('/');
    // Hacer clic en "Iniciar Sesión" en la Landing Page para abrir el modal
    cy.contains('button', 'Iniciar Sesión').click();
  });

  it('debería mostrar error visual con credenciales vacías', () => {
    cy.get('.auth-form-scroll button[type="submit"]').click();
    // Validamos que se muestre la clase de error en los inputs
    cy.get('.auth-form-scroll input[type="email"]').should('have.class', 'border-red-500');
    cy.get('.auth-form-scroll input[type="password"]').should('have.class', 'border-red-500');
  });

  it('debería mostrar error con credenciales incorrectas', () => {
    // Interceptamos específicamente para este test con error 401
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 401,
      body: { error: 'Credenciales inválidas.' }
    }).as('loginInvalido');

    cy.get('.auth-form-scroll input[type="email"]').type('correo_invalido@test.com');
    cy.get('.auth-form-scroll input[type="password"]').type('passwordincorrecto');
    cy.get('.auth-form-scroll button[type="submit"]').click();

    cy.wait('@loginInvalido');

    // El sistema debería mostrar una notificación de error con mensaje del backend
    cy.get('.toast-error').should('be.visible').and('contain.text', 'Credenciales inválidas.');
  });

  it('debería iniciar sesión correctamente con credenciales correctas', () => {
    cy.get('.auth-form-scroll input[type="email"]').type('admin@recicladora.com');
    cy.get('.auth-form-scroll input[type="password"]').type('admin123');
    
    // Iniciamos sesión
    cy.get('.auth-form-scroll button[type="submit"]').click();

    // Debe mostrar la interfaz del Dashboard
    cy.get('.topbar').should('be.visible');
    cy.get('.sidebar').should('be.visible');
    cy.contains('.user-role-pill', 'Admin').should('exist');
  });
});
