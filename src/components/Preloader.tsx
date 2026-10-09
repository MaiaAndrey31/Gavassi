import { useEffect, useRef } from 'react';
import { ScrollTrigger, gsap } from '../lib/gsap';
import { startIntro } from '../lib/intro';

/**
 * Preloader curto: "H" e "G" sobem (CSS, roda antes mesmo do JS), a linha
 * acompanha o carregamento e o painel se recolhe para cima revelando a Hero.
 * Aguarda SOMENTE fontes + foto da Hero (mín. 900 ms, máx. 2,6 s).
 * Fail-safe: script inline no <head> libera o scroll e o CSS esconde o painel se o JS falhar.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();

    const heroImg = document.querySelector<HTMLImageElement>('.hero__img img');
    const waitImg = heroImg
      ? heroImg.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            heroImg.addEventListener('load', () => res(), { once: true });
            heroImg.addEventListener('error', () => res(), { once: true });
          })
      : Promise.resolve();
    const ready = Promise.all([document.fonts?.ready ?? Promise.resolve(), waitImg]);
    const timeout = new Promise((res) => setTimeout(res, 2600));

    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    Promise.race([ready, timeout]).then(() => {
      if (cancelled) return;
      const wait = Math.max(0, (reduce ? 200 : 900) - (performance.now() - t0));
      setTimeout(() => {
        if (cancelled) return;
        const release = () => {
          document.documentElement.classList.remove('is-loading');
          ScrollTrigger.refresh();
        };
        if (reduce) {
          release();
          startIntro();
          tl = gsap.timeline({ onComplete: () => el.remove() });
          tl.to(el, { autoAlpha: 0, duration: 0.3 });
          return;
        }
        tl = gsap.timeline({ onComplete: () => el.remove() });
        tl.to(el.querySelector('.preloader__bar i'), { scaleX: 1, duration: 0.5, ease: 'power2.inOut' })
          .to(el.querySelectorAll('.preloader__mark .w, .preloader__name'), { yPercent: -110, duration: 0.6, stagger: 0.05, ease: 'power3.in' }, '+=0.05')
          .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.25')
          .add(() => {
            release();
            startIntro();
          }, '-=0.75');
      }, wait);
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div className="preloader" ref={ref} aria-hidden="true">
      <div className="preloader__inner">
        <p className="preloader__mark serif">
          <span className="mask">
            <span className="w">H</span>
          </span>
          <span className="mask">
            <em className="w">G</em>
          </span>
        </p>
        <div className="preloader__bar">
          <i />
        </div>
        <p className="label preloader__name-wrap">
          <span className="mask">
            <span className="preloader__name">Heloisa Gavazzi · Festas infantis</span>
          </span>
        </p>
      </div>
    </div>
  );
}
