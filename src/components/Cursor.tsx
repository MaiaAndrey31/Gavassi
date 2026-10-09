import { useEffect, useRef, useState } from 'react';
import { finePointer, gsap } from '../lib/gsap';

/**
 * Cursor sutil — somente com ponteiro fino e sem reduced motion.
 * Um ponto que segue o mouse; sobre links vira um anel; sobre elementos com
 * `data-cursor="Texto"` mostra o rótulo.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(finePointer());
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const label = el.querySelector<HTMLElement>('.cursor__label')!;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    document.documentElement.classList.add('has-cursor');

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      el.classList.add('is-active');
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button');
      const text = t?.dataset.cursor ?? '';
      label.textContent = text;
      el.classList.toggle('is-label', !!text);
      el.classList.toggle('is-link', !!t && !text);
    };
    const leave = () => el.classList.remove('is-active');
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="cursor__ring">
        <span className="cursor__label label" />
      </div>
    </div>
  );
}
