import { useEffect, useRef, useState } from 'react';
import { Picture } from '../components/Picture';
import { contact, festas } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import { getImage } from '../lib/images';
import { useEagerNear } from '../lib/useEagerNear';
import './festas.css';

/**
 * FESTAS — galeria horizontal controlada pelo scroll vertical (desktop).
 * Referência conceitual: "Depth Carousel" + "Focus Reveal" (ScrollTide), adaptadas:
 * a foto que chega ao centro ganha escala, nitidez e legenda; as demais recuam;
 * o fundo da seção absorve um tom suave da cor dominante da festa em foco.
 * Mobile: carrossel nativo com scroll-snap (sem pin).
 */

const PAPER = [245, 240, 232];

/** O container segue a proporção da foto; fotos de baixa resolução (≤ 1000px) ocupam área menor no desktop. */
const ratio = (id: string) => {
  const { w, h } = getImage(id);
  return (w / h).toFixed(4);
};
const isCompact = (id: string) => getImage(id).w <= 1000;
function tint(hex: string, amount = 0.16) {
  const n = parseInt(hex.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const mix = rgb.map((c, i) => Math.round(PAPER[i] * (1 - amount) + c * amount));
  return `rgb(${mix.join(',')})`;
}

export function Festas() {
  const root = useRef<HTMLElement>(null);
  useEagerNear(root);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const tints = festas.items.map((f) => tint(getImage(f.img).color));

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const track = q<HTMLElement>('.festas__track')[0];
        const slides = q<HTMLElement>('.festa');
        const medias = slides.map((s) => s.querySelector<HTMLElement>('.festa__media')!);
        const imgs = slides.map((s) => s.querySelector<HTMLElement>('img')!);
        const setScale = medias.map((m) => gsap.quickSetter(m, 'scale'));
        const setOpacity = slides.map((s) => gsap.quickSetter(s, 'opacity'));
        const setImgX = imgs.map((im) => gsap.quickSetter(im, 'xPercent'));
        let current = -1;
        let centers: number[] = [];

        const measure = () => {
          centers = slides.map((s) => s.offsetLeft + s.offsetWidth / 2);
        };
        const distance = () => track.scrollWidth - window.innerWidth;

        const update = () => {
          const x = Number(gsap.getProperty(track, 'x'));
          const mid = window.innerWidth / 2;
          const span = window.innerWidth * 0.62;
          let best = 0;
          let bestD = Infinity;
          centers.forEach((c, i) => {
            const d = (c + x - mid) / span; // -1..1 próximo do centro
            const ad = Math.min(1, Math.abs(d));
            setScale[i](1 - 0.1 * ad);
            setOpacity[i](1 - 0.42 * ad);
            // parallax interno contido: a foto nunca é ampliada além de 8% (preserva nitidez)
            setImgX[i](gsap.utils.clamp(-3.5, 3.5, -d * 3.5));
            if (Math.abs(d) < bestD) {
              bestD = Math.abs(d);
              best = i;
            }
          });
          if (best !== current) {
            current = best;
            setActive(best);
          }
        };

        gsap.set(imgs, { scale: 1.08 });
        gsap.to([track, q('.festas__intro')[0]], {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.festas__stage')[0],
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              update();
            },
          },
          onUpdate: update,
        });

        // título entra recuando conforme a galeria começa
        gsap.to(q('.festas__intro-title'), {
          xPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: q('.festas__stage')[0], start: 'top top', end: () => '+=' + window.innerWidth * 0.6, scrub: true },
        });

        measure();
        update();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // Mobile/reduced: foco pelo slide mais visível do carrossel nativo
  useEffect(() => {
    const el = rail.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { root: el, threshold: [0.6] },
    );
    el.querySelectorAll('.festa').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const total = String(festas.items.length).padStart(2, '0');

  return (
    <section
      className="festas section"
      id="festas"
      aria-labelledby="festas-title"
      ref={root}
      style={{ ['--tint' as string]: tints[active] }}
    >
      <div className="festas__stage">
        <header className="festas__intro">
            <p className="label festas__eyebrow">Portfólio</p>
            <h2 id="festas-title" className="serif festas__intro-title">
              As <em>festas</em>
            </h2>
            <p className="lead festas__lead">{festas.intro}</p>
            <p className="label festas__hint" aria-hidden="true">
              <span>Role para percorrer</span>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </p>
        </header>

        <div className="festas__track" ref={rail}>
          <div className="festas__spacer" aria-hidden="true" />
          {festas.items.map((f, i) => (
            <figure
              className={`festa${i === active ? ' is-active' : ''}${isCompact(f.img) ? ' festa--compact' : ''}`}
              key={f.img}
              data-i={i}
              style={{ ['--ar' as string]: ratio(f.img) }}
            >
              <div className="festa__media">
                <Picture
                  id={f.img}
                  alt={f.alt}
                  sizes={isCompact(f.img) ? '(min-width: 1024px) min(40vw, 640px), 84vw' : '(min-width: 1024px) 60vw, 84vw'}
                  position={f.pos}
                />
              </div>
              <figcaption className="festa__caption">
                <span className="label festa__n">
                  {String(i + 1).padStart(2, '0')} / {total}
                </span>
                <span className="festa__name serif">
                  <span className="mask">
                    <span>{f.theme}</span>
                  </span>
                </span>
                <span className="label festa__detail">{f.detail}</span>
              </figcaption>
            </figure>
          ))}

          <div className="festas__outro">
            <p className="serif festas__outro-title">
              Cada festa é <em>única</em>.
            </p>
            <a className="link-underline label festas__more" href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
              {festas.more} — {contact.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
