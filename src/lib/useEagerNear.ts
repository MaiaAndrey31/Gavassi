import { useEffect, type RefObject } from 'react';

/**
 * Seções com imagens deslocadas por transform (trilho horizontal, mosaico) enganam o
 * lazy loading nativo, que só dispara em cima da hora. Quando a seção chega a ~1 tela
 * de distância, as imagens dela passam para `eager` — sem pesar no carregamento inicial.
 */
export function useEagerNear(ref: RefObject<HTMLElement | null>, margin = '100% 0px') {
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
          if (img.offsetParent !== null) img.loading = 'eager'; // ignora variantes ocultas (display: none)
        });
        io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
}
