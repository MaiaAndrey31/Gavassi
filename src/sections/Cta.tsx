import { useEffect, useRef, useState } from 'react';
import { contact, cta } from '../content/site';
import { MQ, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';
import type { BalloonScene } from '../three/balloons';
import './cta.css';

/**
 * CTA — fechamento. Fundo noturno com os "balões de luz" (Three.js, carregado
 * só quando a seção se aproxima). Fallback em CSS para reduced motion,
 * ausência de WebGL ou aparelhos modestos.
 */

function canUseWebGL() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Cta() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState<'idle' | 'on' | 'off'>('idle');

  // Three.js: import dinâmico quando o CTA estiver a ~1 viewport de distância
  useEffect(() => {
    const section = root.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    if (!canUseWebGL()) {
      setWebgl('off');
      return;
    }
    let scene: BalloonScene | null = null;
    let disposed = false;
    let visible = false;
    let killVelocity: (() => void) | null = null;

    const near = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || scene) return;
        near.disconnect();
        try {
          const { createBalloons } = await import('../three/balloons');
          if (disposed) return;
          const small = window.innerWidth < 768;
          const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
          scene = createBalloons(canvas, { count: small ? 4 : 7, quality: small || lowCpu ? 'low' : 'high' });
          setWebgl('on');
          if (visible && !document.hidden) scene.start();
          const st = ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => scene?.setVelocity(self.getVelocity()),
          });
          killVelocity = () => st.kill();
        } catch {
          setWebgl('off');
        }
      },
      { rootMargin: '100% 0px' },
    );
    const view = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!scene) return;
      if (visible && !document.hidden) scene.start();
      else scene.stop();
    });
    const onVis = () => {
      if (!scene) return;
      if (document.hidden || !visible) scene.stop();
      else scene.start();
    };
    near.observe(section);
    view.observe(section);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      disposed = true;
      near.disconnect();
      view.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      killVelocity?.();
      scene?.dispose();
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        const offsets = [-9, 4, 11];
        q<HTMLElement>('.cta__line').forEach((line, i) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: q('.cta__title')[0], start: 'top 85%', end: 'top 30%', scrub: 0.6 },
          });
          tl.fromTo(line.querySelector('.w'), { yPercent: 110, y: 0 }, { yPercent: 0, ease: 'power3.out', duration: 0.6 }, i * 0.12);
          // as linhas chegam desalinhadas e se compõem
          tl.fromTo(line, { xPercent: offsets[i] }, { xPercent: 0, ease: 'power2.out', duration: 1 }, 0);
        });
        gsap.from(q('.cta__actions > *'), {
          y: 24,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: q('.cta__actions')[0], start: 'top 92%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className={`cta section is-${webgl}`} id="contato" aria-labelledby="cta-title" ref={root}>
      <canvas ref={canvasRef} className="cta__canvas" aria-hidden="true" />
      <div className="cta__fallback" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="cta__inner wrap">
        <p className="label cta__eyebrow">Orçamento sem compromisso</p>
        <h2 id="cta-title" className="serif cta__title">
          {cta.lines.map((l, i) => (
            <span className="cta__line" key={i}>
              <span className="mask">
                {l.includes('festa') ? (
                  <span className="w">
                    {l.split('festa')[0]}
                    <em>festa</em>
                    {l.split('festa')[1]}
                  </span>
                ) : (
                  <span className="w">{l}</span>
                )}
              </span>
            </span>
          ))}
        </h2>
        <div className="cta__actions">
          <a className="btn btn--light cta__btn" href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" data-cursor="WhatsApp">
            {cta.button}
            <svg className="btn__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <p className="cta__contact">
            <span className="label">{cta.note}</span>
            <a className="link-underline" href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
              {contact.whatsappDisplay}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
