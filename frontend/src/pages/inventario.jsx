import { useState, useEffect } from "react";
import { Api } from "../services/api";
import { obtenerEmojiPorDefecto } from "../utils/emojis";

export default function InventarioPage({ showToast }) {
  const [inventario, setInventario] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [fetching, setFetching] = useState(true);

  const sincronizarInventario = async () => {
    try {
      setFetching(true);
      const [dataInv, dataMats] = await Promise.all([
        Api.inventario(),
        Api.materiales(false)
      ]);
      setInventario(Array.isArray(dataInv) ? dataInv : (dataInv?.items || []));
      setMateriales(Array.isArray(dataMats) ? dataMats : []);
    } catch (err) {
      if (typeof showToast === "function") showToast("error", "Error al leer stock actual.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    sincronizarInventario();
  }, []);

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text1)" }}>Control de Stock en Almacén</h1>
        <p style={{ color: "var(--text3)", margin: "4px 0 0 0" }}>Kárdex centralizado y cubicaje de materiales valorizables disponibles</p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Balance de Masa Actual</h2>
        {fetching ? (
          <p style={{ color: "var(--text3)" }}>Calculando pesajes en almacén...</p>
        ) : inventario.length === 0 ? (
          <p style={{ color: "var(--text3)" }}>No se registran materiales con existencias en bodega.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)", color: "var(--text2)" }}>
                    <th style={{ padding: "12px 8px", width: 40 }}></th>
                    <th style={{ padding: "12px 8px" }}>Código</th>
                    <th style={{ padding: "12px 8px" }}>Material</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Stock Neto</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Última Actualización</th>
                  </tr>
              </thead>
              <tbody>
                {inventario.map((inv) => {
                  const mat = materiales.find(m => m.id_material === inv.id_material);
                  return (
                    <tr key={inv.id_inventario || inv.id_material} style={{ borderBottom: "1px solid var(--border)", color: "var(--text1)" }}>
                      <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 20 }}>
                        {mat ? (mat.emoji || obtenerEmojiPorDefecto(mat.categoria?.nombre)) : "♻️"}
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--primary)" }}>
                        {mat ? mat.etiqueta : "—"}
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: 500 }}>
                        {mat ? mat.nombre : "Material Desconocido"}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, fontSize: 15, color: parseFloat(inv.stock_kg || 0) > 0 ? "var(--success)" : "var(--text3)" }}>
                        {parseFloat(inv.stock_kg || 0).toFixed(1)} kg
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right", color: "var(--text3)" }}>
                        {inv.ultima_actualizacion ? new Date(inv.ultima_actualizacion).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
