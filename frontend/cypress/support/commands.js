Cypress.Commands.add('login', (email, password) => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem('eco_token', 'mock-jwt-token-12345');
      win.sessionStorage.setItem('eco_user', JSON.stringify({
        id: 'user-uuid-111',
        rol: 'ADMIN',
        nombre: 'Admin',
        apellido: 'Recicladora',
        email: email || 'admin@recicladora.com',
        id_empresa: 'empresa-uuid-999',
        activo: true
      }));
    }
  });
});
