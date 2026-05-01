"use client";

import { useEffect, useState } from "react";

export function ClinicalFuturesLayer() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div className="clinical-futures-field" aria-hidden>
      {!reduceMotion && <div className="clinical-futures-field__sweep" />}
      <div className="clinical-futures-field__raster" />
    </div>
  );
}
