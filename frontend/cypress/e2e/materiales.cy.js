describe('Gestión de Materiales (CRUD)', () => {
  beforeEach(() => {
    // Iniciamos sesión programáticamente para no demorar los tests
    cy.login('admin@recicladora.com', 'admin123');
    
    // Esperamos a que los requests de carga inicial terminen para garantizar que React no desmonte el DOM del sidebar
    cy.wait(['@meRequest', '@materialesRequest', '@proveedoresRequest', '@inventarioRequest']);

    // Esperamos a que la barra superior esté visible
    cy.get('.topbar').should('be.visible');

    // Navegamos a la sección de Lista Maestra de Materiales
    cy.contains('.nav-item', 'Lista Maestra').click();

    // Esperamos a que la página cambie e imprima el título principal
    cy.contains('h1', 'Lista Maestra de Materiales').should('exist');
  });

  it('debería mostrar la tabla de catálogo y el formulario de alta', () => {
    cy.contains('h1', 'Lista Maestra de Materiales').should('exist');
    cy.contains('h2', 'Nuevo Material').should('exist');
    cy.get('form').should('exist');
  });

  it('debería registrar un nuevo material exitosamente', () => {
    const randomTag = 'MAT-' + Math.floor(Math.random() * 100000);
    const materialName = 'Material Test ' + randomTag;
    
    // Seleccionamos la primera categoría disponible (omitimos la opción por defecto)
    cy.get('select[name="id_categoria"]').should('not.be.disabled').select(1);

    // Rellenamos los campos
    cy.get('input[name="etiqueta"]').type(randomTag);
    cy.get('input[name="nombre"]').type(materialName);
    cy.get('input[name="precio_referencial_kg"]').type('2.50');

    // Enviamos el formulario
    cy.get('button[type="submit"]').click();

    // Verificamos que se muestre una notificación exitosa
    cy.get('.toast-success').should('exist');

    // Validamos que aparezca en la lista maestra (tabla)
    cy.contains('td', randomTag).should('exist');
    cy.contains('td', materialName).should('exist');
  });
});
