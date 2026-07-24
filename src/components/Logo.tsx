import { useEffect, useState } from "react";
import logoSrc from "@/assets/logo.png";

/* Elimina el fondo blanco del logo usando canvas */
function useTransparentLogo(src: string) {
  const [dataUrl, setDataUrl] = useState<string>(src);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const out   = ctx.getImageData(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Luminosidad del píxel (0-765)
        const lum = r + g + b;
        // Saturación (diferencia entre canal más alto y más bajo)
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        if (lum > 690 && sat < 25) {
          // Blanco puro → completamente transparente
          out.data[i + 3] = 0;
        } else if (lum > 645 && sat < 40) {
          // Casi blanco → semi-transparente según luminosidad
          out.data[i + 3] = Math.round(255 * (1 - (lum - 645) / 100));
        }
        // Colores con saturación → se quedan opacos
      }

      ctx.putImageData(out, 0, 0);
      setDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);

  return dataUrl;
}

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const heights = { sm: 38, md: 52, lg: 72, xl: 100 } as const;
  const processedSrc = useTransparentLogo(logoSrc);

  return (
    <img
      src={processedSrc}
      alt="NutriGuate"
      style={{ height: heights[size], width: "auto", display: "block" }}
      draggable={false}
    />
  );
};
