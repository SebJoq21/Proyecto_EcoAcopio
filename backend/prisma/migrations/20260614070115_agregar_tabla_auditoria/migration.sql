-- CreateEnum
CREATE TYPE "AccionAuditoria" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR');

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" UUID NOT NULL,
    "id_empresa" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "accion" "AccionAuditoria" NOT NULL,
    "id_registro_afectado" UUID NOT NULL,
    "valores_anteriores" JSON,
    "valores_nuevos" JSON,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
