import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { trajetoria } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import './trajetoria.css';

/**
 * TRAJETÓRIA — sem timeline convencional.
 * Desktop: palco fixo. O marco (2011 → 15 → Casa → Hoje) rola como um contador,
 * a moldura da foto muda de forma a cada capítulo (a composição se transforma)
 * e a nova foto sobe em arco por cima da anterior.
 * Mobile: capítulos empilhados com revelação curta da foto.
 */

/** formas da moldura por capítulo — frações do contêiner (top, right, bottom, left, raio) */
const SHAPES = [
  { t: 0.12, r: 0.2, b: 0.1, l: 0.3, arch: true },
  { t: 0.04, r: 0.08, b: 0.2, l: 0.24, arch: false },
  { t: 0.2, r: 0, b: 0.16, l: 0.02, arch: false },
  { t: 0, r: 0, b: 0, l: 0, arch: false },
];

export function Trajetoria() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const media = q<HTMLElement>('.traj__media')[0];
        const shots = q<HTMLElement>('.traj__frame .traj__shot');
        const texts = q<HTMLElement>('.traj__texts .traj__text');
        const n = shots.length;

        const shape = (i: number) => () => {
          const { width: w, height: h } = media.getBoundingClientRect();
          const s = SHAPES[i];
          // retrato: o recorte da moldura acompanha a proporção da foto (alinhado à direita da coluna)
          const portrait = trajetoria.chapters[i].frame?.desktop;
          if (portrait) {
            const cw = Math.min(w, h * portrait);
            return `inset(0px 0px 0px ${w - cw}px round 6px 6px 6px 6px)`;
          }
          const r = s.arch ? (w * (1 - s.l - s.r)) / 2 : 6;
          return `inset(${s.t * h}px ${s.r * w}px ${s.b * h}px ${s.l * w}px round ${r}px ${r}px ${s.arch ? 0 : 6}px ${s.arch ? 0 : 6}px)`;
        };

        gsap.set(shots.slice(1), { clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' });
        gsap.set(texts.slice(1).map((t) => t.querySelectorAll('.traj__reveal')), { yPercent: 110, autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: q('.traj__stage')[0],
            start: 'top top',
            end: () => '+=' + window.innerHeight * (n - 0.4) * 1.1,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(q('.traj__frame'), { clipPath: shape(0) }, { clipPath: shape(0), duration: 0.01 }, 0);
        tl.fromTo(shots[0].querySelector('img'), { scale: 1.15 }, { scale: 1, duration: 1, ease: 'none' }, 0);

        for (let i = 1; i < n; i++) {
          const at = i * 1.1 - 0.4;
          // a moldura muda de forma
          tl.to(q('.traj__frame'), { clipPath: shape(i), duration: 1 }, at);
          // a nova foto sobe em arco; a anterior recua
          tl.fromTo(
            shots[i],
            { clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)', duration: 1 },
            at,
          );
          tl.fromTo(shots[i].querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 1.3, ease: 'power2.out' }, at);
          tl.to(shots[i - 1].querySelector('img'), { scale: 0.92, yPercent: -6, duration: 1 }, at);
          // o marco rola como um contador
          tl.to(q('.traj__marks-track'), { yPercent: (-100 / n) * i, duration: 0.9 }, at + 0.05);
          // texto troca por máscara
          tl.to(texts[i - 1].querySelectorAll('.traj__reveal'), { yPercent: -110, autoAlpha: 0, duration: 0.45, stagger: 0.05, ease: 'power2.in' }, at);
          tl.to(texts[i].querySelectorAll('.traj__reveal'), { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, at + 0.45);
          // progresso
          tl.to(q('.traj__progress i'), { scaleX: (i + 1) / n, duration: 0.9 }, at);
        }
        tl.to({}, { duration: 0.3 });
      });

      mm.add(MQ.mobile, () => {
        q<HTMLElement>('.traj__chapter').forEach((ch) => {
          const shot = ch.querySelector('.traj__shot');
          if (shot)
            gsap.fromTo(
              shot,
              { clipPath: 'inset(28% 10% 0% 10% round 50% 50% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0% round 50% 50% 0% 0%)',
                ease: 'none',
                scrollTrigger: { trigger: shot, start: 'top 95%', end: 'top 35%', scrub: 0.5 },
              },
            );
          gsap.from(ch.querySelectorAll('.traj__reveal'), {
            yPercent: 60,
            autoAlpha: 0,
            stagger: 0.08,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: ch, start: 'top 70%' },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const { chapters } = trajetoria;

  return (
    <section className="traj section" id="trajetoria" aria-labelledby="traj-title" ref={root}>
      <header className="traj__head wrap">
        <p className="label traj__eyebrow">Trajetória</p>
        <h2 id="traj-title" className="serif traj__title">
          {trajetoria.title}
        </h2>
      </header>

      <div className="traj__stage">
        {/* coluna de texto */}
        <div className="traj__copy">
          <div className="traj__marks" aria-hidden="true">
            <div className="traj__marks-track">
              {chapters.map((c) => (
                <span className="traj__mark serif" key={c.mark}>
                  {c.mark}
                </span>
              ))}
            </div>
          </div>
          <div className="traj__texts">
            {chapters.map((c, i) => (
              <article className="traj__text" key={c.mark} data-i={i}>
                <p className="label traj__label traj__reveal">
                  <span className="traj__mark-inline serif">{c.mark}</span> {c.label}
                </p>
                <h3 className="serif traj__chapter-title traj__reveal">{c.title}</h3>
                <blockquote className="traj__quote traj__reveal">
                  <p>“{c.quote}”</p>
                  <cite className="label">Heloisa Gavazzi</cite>
                </blockquote>
              </article>
            ))}
          </div>
          <div className="traj__progress" aria-hidden="true">
            <i />
          </div>
        </div>

        {/* coluna de imagem */}
        <div className="traj__media">
          <div className="traj__frame">
            {chapters.map((c, i) => (
              <figure
                className="traj__shot"
                key={c.mark}
                data-portrait={c.frame ? '' : undefined}
                style={{ zIndex: i + 1, ['--ar' as string]: c.frame?.desktop }}
              >
                <Picture
                  id={c.img}
                  alt={c.alt}
                  sizes={c.frame ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 52vw, 100vw'}
                  position={c.pos}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* versão em capítulos (mobile / reduced motion) */}
      <ol className="traj__chapters wrap">
        {chapters.map((c) => (
          <li className="traj__chapter" key={c.mark}>
            <p className="serif traj__chapter-mark traj__reveal" aria-hidden="true">
              {c.mark}
            </p>
            <figure
              className="traj__shot"
              style={
                c.frame
                  ? { ['--ar-m' as string]: c.frame.mobile, ['--ar-t' as string]: c.frame.tablet }
                  : undefined
              }
            >
              <Picture id={c.img} alt={c.alt} sizes={c.frame ? '(min-width: 768px) 50vw, 92vw' : '(min-width: 768px) 50vw, 100vw'} position={c.pos} />
            </figure>
            <p className="label traj__label traj__reveal">
              <span className="sr-only">{c.mark} — </span>
              {c.label}
            </p>
            <h3 className="serif traj__chapter-title traj__reveal">{c.title}</h3>
            <blockquote className="traj__quote traj__reveal">
              <p>“{c.quote}”</p>
              <cite className="label">Heloisa Gavazzi</cite>
            </blockquote>
          </li>
        ))}
      </ol>
    </section>
  );
}
