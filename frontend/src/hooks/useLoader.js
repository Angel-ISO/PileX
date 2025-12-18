import { useState, useEffect } from "react";


export function useLoader({ minDuration = 1500, text = "Cargando..." } = {}) {
  const [loading, setLoading] = useState(true);
  const [loaderText, setLoaderText] = useState(text);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  return { loading, setLoading, loaderText, setLoaderText };
}
