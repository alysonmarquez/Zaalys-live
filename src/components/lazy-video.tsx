"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

// Vídeo mudo em loop que só baixa e toca quando aparece na tela (e pausa quando sai).
// Até lá mostra só a capa: numa lista de vídeos o celular não baixa todos de uma vez.
type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "autoPlay" | "preload"> & { src: string };

export function LazyVideo({ src, poster, ...rest }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      rootMargin: "150px 0px",
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      if (!el.getAttribute("src")) el.setAttribute("src", src);
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [visible, src]);

  // Trocou o vídeo (ex.: outro template no modal): recarrega se já estava visível.
  useEffect(() => {
    const el = ref.current;
    if (el?.getAttribute("src") && el.getAttribute("src") !== src) {
      el.setAttribute("src", src);
      void el.play().catch(() => {});
    }
  }, [src]);

  return <video ref={ref} poster={poster} preload="none" muted loop playsInline {...rest} />;
}
