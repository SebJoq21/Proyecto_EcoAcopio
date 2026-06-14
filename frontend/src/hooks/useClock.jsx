import { useState, useEffect } from "react";

function fmt() {
  const now = new Date();
  const date = now.toLocaleDateString("es-PE", {
    day: "numeric", month: "short", year: "numeric"
  }).replace(".", "");
  const time = now.toLocaleTimeString("es-PE");
  return { date, time };
}

export function useClock() {
  const [clock, setClock] = useState(fmt);

  useEffect(() => {
    const iv = setInterval(() => setClock(fmt()), 1000);
    return () => clearInterval(iv);
  }, []);

  return clock;
}