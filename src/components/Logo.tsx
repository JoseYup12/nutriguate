import { useEffect, useState } from "react";
import logoSrc from "@/assets/logo.png";

/* Elimina SOLO el fondo blanco puro — respeta colores claros como la nutria */
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

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];

        // Solo eliminar píxeles REALMENTE blancos (los tres canales > 248)
        if (r > 248 && g > 248 && b > 248) {
          // Transición suave: 248-255 → de opaco a transparente
          const whiteness = Math.min(r, g, b);
          d[i + 3] = Math.round(255 * (1 - (whiteness - 248) / 7));
        }
        // Todo lo demás (verde claro de la nutria, celeste, verde lima) queda opaco
      }

      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);

  return dataUrl;
}

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const heights = { sm: 48, md: 72, lg: 96, xl: 128 } as const;
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
