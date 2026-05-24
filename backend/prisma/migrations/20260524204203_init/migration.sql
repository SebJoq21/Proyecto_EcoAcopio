-- CreateTable
CREATE TABLE "empresas" (
    "id_empresa" UUID NOT NULL,
    "razon_social" VARCHAR(100) NOT NULL,
    "ruc" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "rol" VARCHAR(20) NOT NULL,
    "contraseña" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "categorias_materiales" (
    "id_categoria" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_materiales_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id_material" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "id_categoria" UUID NOT NULL,
    "etiqueta" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "precio_referencial_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id_material")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id_provider" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "tipo_documento" VARCHAR(100),
    "numero_documento" VARCHAR(20),
    "telefono" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "es_anonimo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_provider")
);

-- CreateTable
CREATE TABLE "inventarios" (
    "id_inventario" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "id_material" UUID NOT NULL,
    "stock_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "stock_minimo_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "ultima_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "cierres_mensuales" (
    "id_cierre" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "total_kilos_comprados" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_kilos_vendidos" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "inversion_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "ingreso_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "fecha_cierre" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierres_mensuales_pkey" PRIMARY KEY ("id_cierre")
);

-- CreateTable
CREATE TABLE "pesajes" (
    "id_pesaje" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "id_material" UUID NOT NULL,
    "id_proveedor" UUID NOT NULL,
    "id_cierre" UUID,
    "tipo_movimiento" VARCHAR(20) NOT NULL,
    "peso_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "precio_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "observaciones" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Completado',
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesajes_pkey" PRIMARY KEY ("id_pesaje")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_razon_social_key" ON "empresas"("razon_social");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ruc_key" ON "empresas"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_empresa_email" ON "usuarios"("id_empresa", "email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_proveedor_empresa_doc" ON "proveedores"("id_empresa", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "uq_inventario_empresa_material" ON "inventarios"("id_empresa", "id_material");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cierre_empresa_periodo" ON "cierres_mensuales"("id_empresa", "mes", "año");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_materiales" ADD CONSTRAINT "categorias_materiales_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias_materiales"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios" ADD CONSTRAINT "inventarios_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "materiales"("id_material") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_mensuales" ADD CONSTRAINT "cierres_mensuales_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_mensuales" ADD CONSTRAINT "cierres_mensuales_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesajes" ADD CONSTRAINT "pesajes_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesajes" ADD CONSTRAINT "pesajes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesajes" ADD CONSTRAINT "pesajes_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "materiales"("id_material") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesajes" ADD CONSTRAINT "pesajes_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedores"("id_provider") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesajes" ADD CONSTRAINT "pesajes_id_cierre_fkey" FOREIGN KEY ("id_cierre") REFERENCES "cierres_mensuales"("id_cierre") ON DELETE SET NULL ON UPDATE CASCADE;
