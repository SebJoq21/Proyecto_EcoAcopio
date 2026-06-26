export const emojisDisponibles = [
  { emoji: "♻️", label: "Reciclaje" },
  { emoji: "☢️", label: "Residuos Tóxicos" },
  { emoji: "🔩", label: "Metales" },
  { emoji: "📦", label: "Cartón" },
  { emoji: "📄", label: "Papel" },
  { emoji: "🧴", label: "Plástico" },
  { emoji: "🥫", label: "Latas" },
  { emoji: "🍃", label: "Orgánico" },
  { emoji: "🔋", label: "Pilas" },
  { emoji: "💡", label: "Electrónicos" },
  { emoji: "👕", label: "Textiles" },
  { emoji: "🪵", label: "Madera" },
  { emoji: "🪣", label: "Aceites" },
  { emoji: "🛢️", label: "Hidrocarburos" },
];

export const obtenerEmojiPorDefecto = (nombreCat) => {
  if (!nombreCat) return "♻️";
  const name = nombreCat.toLowerCase().trim();
  if (name.includes("tóxico") || name.includes("toxico") || name.includes("toxic") || name.includes("radiaci")) return "☢️";
  if (name.includes("metal") || name.includes("fierro") || name.includes("cobre") || name.includes("aluminio")) return "🔩";
  if (name.includes("cartón") || name.includes("carton") || name.includes("caja")) return "📦";
  if (name.includes("papel") || name.includes("hoja") || name.includes("archivo")) return "📄";
  if (name.includes("plástico") || name.includes("plastico") || name.includes("botella") || name.includes("pet")) return "🧴";
  if (name.includes("lata") || name.includes("aluminio") || name.includes("conserva")) return "🥫";
  if (name.includes("orgánico") || name.includes("organico") || name.includes("comida") || name.includes("residuo org")) return "🍃";
  if (name.includes("pila") || name.includes("batería") || name.includes("bateria")) return "🔋";
  if (name.includes("electrónico") || name.includes("electronico") || name.includes("e-waste")) return "💡";
  if (name.includes("textil") || name.includes("ropa") || name.includes("tela")) return "👕";
  if (name.includes("madera") || name.includes("palo") || name.includes("tabla")) return "🪵";
  if (name.includes("aceite") || name.includes("grasa") || name.includes("lubricante")) return "🪣";
  if (name.includes("hidrocarburo") || name.includes("petróleo") || name.includes("petroleo") || name.includes("combustible")) return "🛢️";
  return "♻️";
};
