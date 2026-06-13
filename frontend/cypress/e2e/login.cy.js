describe('Flujo de Autenticación (Login)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debería mostrar error con credenciales vacías', () => {
    cy.get('button[type="submit"]').click();
    // Validamos que se muestre el aviso o alerta de error
    cy.on('window:alert', (str) => {
      expect(str).to.equal('⚠️ El email y la contraseña son obligatorios.');
    });
  });

  it('debería mostrar error con credenciales incorrectas', () => {
    cy.get('input[type="email"]').type('correo_invalido@test.com');
    cy.get('input[type="password"]').type('passwordincorrecto');
    cy.get('button[type="submit"]').click();

    // El sistema debería mostrar una notificación de error con mensaje del backend
    cy.get('.toast-error').should('exist');
  });

  it('debería iniciar sesión correctamente con credenciales demo', () => {
    // Hacemos clic en el botón de Demo Admin para autorellenar
    cy.contains('button', 'Demo Admin').click();
    
    // El formulario debe rellenarse
    cy.get('input[type="email"]').should('have.value', 'admin@recicladora.com');
    cy.get('input[type="password"]').should('have.value', 'admin123');
    
    // Iniciamos sesión
    cy.get('button[type="submit"]').click();

    // Debe desaparecer la pantalla de login y mostrar la interfaz del Dashboard
    cy.get('.login-screen').should('not.exist');
    cy.get('.topbar').should('exist');
    cy.get('.sidebar').should('exist');
    cy.contains('.user-role-pill', 'Admin').should('exist');
  });
});
