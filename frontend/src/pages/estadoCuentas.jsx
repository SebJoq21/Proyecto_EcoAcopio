import { useState, useEffect } from "react";
import { Api } from "../services/api";
import Modal from "../components/Modal";

export default function EstadoCuentasPage({ showToast }) {
  const user = Api.getUser();
  const isAdmin = user?.rol ? String(user.rol).toUpperCase() === "ADMIN" : false;

  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [fetchingProveedores, setFetchingProveedores] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formMovimiento, setFormMovimiento] = useState({
    tipo: "ABONO",
    monto: "",
    concepto: "",
  });

  useEffect(() => {
    Api.proveedores()
      .then((data) => setProveedores(Array.isArray(data) ? data : []))
      .catch(() => showToast?.("error", "Error al cargar proveedores"))
      .finally(() => setFetchingProveedores(false));
  }, []);

  useEffect(() => {
    if (!idProveedor) {
      setMovimientos([]);
      setSaldo(0);
      return;
    }
    setCargando(true);
    Api.estadoCuenta(idProveedor)
      .then((data) => {
        setMovimientos(Array.isArray(data?.data) ? data.data : []);
        const prov = proveedores.find(
          (p) => String(p.id_proveedor || p.id_provider || p.id) === String(idProveedor)
        );
        setSaldo(Number(prov?.saldo_actual || 0));
      })
      .catch(() => showToast?.("error", "Error al cargar el estado de cuenta"))
      .finally(() => setCargando(false));
  }, [idProveedor]);

  const handleChangeMovimiento = (e) => {
    const { name, value } = e.target;
    setFormMovimiento((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrarMovimiento = async (e) => {
    e.preventDefault();
    if (!formMovimiento.monto || Number(formMovimiento.monto) <= 0) {
      showToast?.("error", "Ingresa un monto valido");
      return;
    }
    if (!formMovimiento.concepto.trim()) {
      showToast?.("error", "El concepto es obligatorio");
      return;
    }

    setEnviando(true);
    try {
      const usuario = Api.getUser();
      await Api.registrarMovimiento({
        id_proveedor: idProveedor,
        id_usuario: usuario?.id_usuario || usuario?.id,
        tipo_movimiento: formMovimiento.tipo,
        monto: Number(formMovimiento.monto),
        concepto: formMovimiento.concepto.trim(),
      });
      showToast?.("success", "Movimiento registrado exitosamente");
      setModalAbierto(false);
      setFormMovimiento({ tipo: "ABONO", monto: "", concepto: "" });
      const data = await Api.estadoCuenta(idProveedor);
      setMovimientos(Array.isArray(data?.data) ? data.data : []);
      const prov = proveedores.find(
        (p) => String(p.id_proveedor || p.id_provider || p.id) === String(idProveedor)
      );
      setSaldo(Number(prov?.saldo_actual || 0));
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      showToast?.("error", err.message || "Error al registrar movimiento");
    } finally {
      setEnviando(false);
    }
  };

  const proveedorSeleccionado = proveedores.find(
    (p) => String(p.id_proveedor || p.id) === String(idProveedor)
  );

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg0)" }}>
        <div style={{ textAlign: "center", color: "var(--text2)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ color: "var(--text1)", marginBottom: 8 }}>Acceso Denegado</h2>
          <p>Esta vista es exclusiva para Administradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Estado de Cuenta</h1>
        <p className="page-sub">Consulta y administra los movimientos financieros de tus proveedores</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: 260, flex: 1 }}>
          <label className="form-label">Proveedor</label>
          <select
            className="form-select"
            value={idProveedor}
            onChange={(e) => setIdProveedor(e.target.value)}
            disabled={fetchingProveedores}
          >
            <option value="">{fetchingProveedores ? "Cargando..." : "-- Seleccionar proveedor --"}</option>
            {proveedores.map((p) => (
              <option key={p.id_proveedor || p.id_provider || p.id} value={p.id_proveedor || p.id_provider || p.id}>
                {p.nombre_completo || p.nombre} {p.numero_documento ? `(${p.numero_documento})` : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalAbierto(true)}
          disabled={!idProveedor}
          style={{ marginTop: 20 }}
        >
          + Nuevo Movimiento
        </button>
      </div>

      {idProveedor && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                Saldo Actual — {proveedorSeleccionado?.nombre_completo || proveedorSeleccionado?.nombre || "Proveedor"}
              </span>
            </div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "var(--mono)",
              color: saldo > 0 ? "var(--red)" : "var(--green)",
            }}>
              {saldo > 0 ? "-" : ""}S/ {Math.abs(saldo).toFixed(2)}
              <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 6, color: "var(--text3)" }}>
                {saldo > 0 ? "(deuda a proveedor)" : saldo < 0 ? "(a favor de la empresa)" : "(saldo en cero)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {idProveedor && (
        <div className="card">
          <div className="card-title">Historial de Movimientos</div>
          {cargando ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text2)" }}>
              <span className="spinner" />
            </div>
          ) : movimientos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text2)" }}>
              No hay movimientos registrados para este proveedor
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>CONCEPTO</th>
                    <th>TIPO</th>
                    <th>MONTO</th>
                    <th>USUARIO</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m, i) => (
                    <tr key={m.id_movimiento || m.id || i}>
                      <td>{m.fecha_creacion ? new Date(m.fecha_creacion).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}</td>
                      <td><span className="main-cell">{m.concepto || "—"}</span></td>
                      <td>
                        <span className={`badge ${m.tipo_movimiento === "CARGO" ? "badge-red" : "badge-green"}`}>
                          {m.tipo_movimiento === "CARGO" ? "Cargo" : "Abono"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontWeight: 600, color: m.tipo_movimiento === "CARGO" ? "var(--red)" : "var(--green)" }}>
                        {m.tipo_movimiento === "CARGO" ? "-" : "+"} S/ {Number(m.monto || 0).toFixed(2)}
                      </td>
                      <td style={{ color: "var(--text3)" }}>{m.usuario?.nombres ? m.usuario.nombres + " " + (m.usuario.apellidos || "") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!idProveedor && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text2)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📒</div>
          <p>Selecciona un proveedor para ver su estado de cuenta</p>
        </div>
      )}

      {modalAbierto && (
        <Modal onClose={() => setModalAbierto(false)}>
          <div className="modal-title">Nuevo Movimiento</div>
          <div className="modal-sub">
            Registrar cargo o abono para {proveedorSeleccionado?.nombre_completo || proveedorSeleccionado?.nombre || "el proveedor"}
          </div>
          <form onSubmit={handleRegistrarMovimiento} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tipo de Movimiento</label>
              <select name="tipo" className="form-select" value={formMovimiento.tipo} onChange={handleChangeMovimiento}>
                <option value="ABONO">Abono (a favor del proveedor)</option>
                <option value="CARGO">Cargo (deuda del proveedor)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Monto (S/) <span className="req">*</span></label>
              <input
                type="number"
                name="monto"
                className="form-input"
                step="0.01"
                min="0.01"
                value={formMovimiento.monto}
                onChange={handleChangeMovimiento}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Concepto <span className="req">*</span></label>
              <input
                type="text"
                name="concepto"
                className="form-input"
                value={formMovimiento.concepto}
                onChange={handleChangeMovimiento}
                placeholder="Ej: Pago por lote de plastico"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? "Registrando..." : "Registrar Movimiento"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
