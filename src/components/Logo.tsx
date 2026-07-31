import { useEffect, useState } from "react";
import logoSrc from "@/assets/logo.png";

function useTransparentLogo(src: string) {
  const [dataUrl, setDataUrl] = useState<string>(src);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const id = ctx.getImageData(0, 0, W, H);
      const d = id.data;

      // Paso 1: solo eliminar blanco puro
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r > 248 && g > 248 && b > 248) {
          d[i + 3] = Math.round(255 * (1 - (Math.min(r, g, b) - 248) / 7));
        }
      }
      ctx.putImageData(id, 0, 0);

      // Paso 2: auto-recorte al contenido real (elimina márgenes vacíos)
      const cd = ctx.getImageData(0, 0, W, H).data;
      let minX = W, minY = H, maxX = 0, maxY = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (cd[(y * W + x) * 4 + 3] > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const pad = 30;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(W, maxX + pad);
      maxY = Math.min(H, maxY + pad);

      const cw = maxX - minX, ch = maxY - minY;
      const out = document.createElement("canvas");
      out.width = cw; out.height = ch;
      out.getContext("2d")!.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);

      setDataUrl(out.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);

  return dataUrl;
}

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const heights = { sm: 120, md: 300, lg: 380, xl: 480 } as const;
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
