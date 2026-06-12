Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.request('POST', 'http://localhost:4000/api/v1/auth/login', {
    email,
    password
  }).then((response) => {
    const { token, usuario } = response.body;
    const usuarioHomologado = {
      id: usuario.id_usuario,
      rol: usuario.rol,
      nombre: usuario.nombres || '',
      apellido: usuario.apellidos || '',
      email: usuario.email,
      id_empresa: usuario.id_empresa,
      activo: usuario.activo
    };
    localStorage.setItem('eco_token', token);
    localStorage.setItem('eco_user', JSON.stringify(usuarioHomologado));
  });
});
