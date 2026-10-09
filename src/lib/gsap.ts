import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Variantes de movimento. Toda animação é registrada dentro de `gsap.matchMedia()`
 * para que mude de variante (e limpe a anterior) automaticamente.
 *  - desktop: pin, scrub e composições completas
 *  - mobile:  scroll nativo, scrub curto, sem pin longo
 *  - reduce:  nada se move; conteúdo sempre visível
 */
export const MQ = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

export const finePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (import.meta.env.DEV) (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;

export { gsap, ScrollTrigger, useGSAP };
