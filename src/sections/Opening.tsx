import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { Words } from '../components/Words';
import { hero, manifesto } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import { onIntro } from '../lib/intro';
import './opening.css';

/**
 * ABERTURA = Hero + Manifesto.
 * Desktop: um único palco fixo. O arco da foto se abre, o nome se separa em
 * profundidades diferentes e uma "porta" em arco atravessa a fotografia
 * revelando o manifesto — onde cada frase traz uma peça da festa.
 * Mobile: fluxo vertical nativo com scrub curto. Reduced motion: estático.
 */

const vw = () => window.innerWidth;
const vh = () => window.innerHeight;

const clamp = (min: number, v: number, max: number) => Math.min(Math.max(v, min), max);

/** janela em arco da Hero (desktop) — GRANDE desde o primeiro frame; espelha o CSS */
function archDesktop() {
  const w = Math.min(clamp(700, vw() * 0.62, 1250), vw() * 0.92);
  const h = Math.min(clamp(560, vh() * 0.82, 950), vh() * 0.88);
  const left = (vw() - w) / 2;
  const bottom = vh() * 0.05;
  const top = vh() - h - bottom;
  return `inset(${top}px ${left}px ${bottom}px ${left}px round ${w / 2}px ${w / 2}px 0px 0px)`;
}
const fullRect = 'inset(0px 0px 0px 0px round 0px 0px 0px 0px)';

export function Opening() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // ---------- intro (após o preloader) ----------
      const intro = gsap.timeline({ paused: true });
      intro
        .from(q('.hero__frame-wrap'), { scale: 0.86, yPercent: 6, duration: 1.6, ease: 'expo.out' }, 0)
        .from(q('.hero__img img'), { scale: 1.15, duration: 2, ease: 'expo.out' }, 0)
        .from(q('.hero__line .w'), { yPercent: 115, y: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' }, 0.15)
        .from(q('.hero__float picture'), { scale: 0.6, autoAlpha: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.35)
        .from(q('.hero__meta > *'), { y: 16, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.6);
      const stopIntro = onIntro(() =>
        window.matchMedia(MQ.reduce).matches ? intro.progress(1) : intro.play(),
      );

      // ---------- desktop ----------
      mm.add(MQ.desktop, () => {
        const lines = q<HTMLElement>('.mline');
        const pieces = q<HTMLElement>('.piece');

        gsap.set(q('.manifesto'), { clipPath: () => portalStart() });
        gsap.set(q('.mline .w'), { yPercent: 115, y: 0 });
        gsap.set(pieces, { autoAlpha: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + vh() * 6.2,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        // 1 · a janela em arco se abre até virar a tela inteira
        tl.fromTo(q('.hero__frame'), { clipPath: archDesktop }, { clipPath: fullRect, duration: 1.4, ease: 'power2.inOut' }, 0)
          // a foto nunca fica menor que a tela (sem bordas) e o zoom total é contido (original de 1500px)
          .fromTo(q('.hero__img'), { scale: 1.06 }, { scale: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
          // 2 · o nome se separa: "Heloisa" recua para trás da foto, "Gavazzi" avança em direção à câmera
          .to(q('.hero__line--1'), { xPercent: -30, yPercent: -55, scale: 0.85, duration: 1.3, ease: 'power2.in' }, 0)
          .to(q('.hero__line--1'), { autoAlpha: 0, duration: 0.35 }, 1.0)
          .to(q('.hero__line--2'), { xPercent: 22, yPercent: 70, scale: 1.55, duration: 1.4, ease: 'power2.in' }, 0)
          .to(q('.hero__line--2'), { autoAlpha: 0, duration: 0.35 }, 1.05)
          // 3 · peças em primeiro plano atravessam a viewport (profundidade)
          .to(q('.hero__float--a'), { x: () => -vw() * 0.32, y: () => vh() * 0.55, scale: 2.6, duration: 1.3, ease: 'power2.in' }, 0)
          .to(q('.hero__float--b'), { x: () => vw() * 0.3, y: () => -vh() * 0.5, scale: 2, duration: 1.3, ease: 'power2.in' }, 0)
          .to(q('.hero__meta'), { y: -30, autoAlpha: 0, duration: 0.4 }, 0)
          // 4 · a câmera "entra" na foto…
          .to(q('.hero__img'), { scale: 1.1, duration: 1.4, ease: 'power1.in' }, 1.4)
          // 5 · …e uma porta em arco se abre no centro, revelando o manifesto
          .fromTo(q('.manifesto'), { clipPath: portalStart }, { clipPath: portalMid, duration: 0.9, ease: 'power2.in' }, 1.6)
          .to(q('.manifesto'), { clipPath: fullRect, duration: 0.45, ease: 'power2.out' }, 2.5)
          .set(q('.hero'), { autoAlpha: 0 }, 2.96);

        // 6 · manifesto: uma frase por vez; cada frase traz uma peça da festa
        let t = 2.35;
        lines.forEach((line, i) => {
          const words = line.querySelectorAll('.w');
          tl.to(words, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, t);
          const piece = pieces[i];
          if (piece) {
            const dir = PIECE_FROM[i % PIECE_FROM.length];
            tl.fromTo(
              piece,
              { autoAlpha: 0, x: () => dir.x * vw(), y: () => dir.y * vh(), scale: 1.6, rotate: dir.r },
              { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: dir.r * 0.15, duration: 1, ease: 'power3.out' },
              t + 0.1,
            );
            tl.fromTo(piece.querySelector('img'), { scale: 1.4 }, { scale: 1, duration: 1.2, ease: 'power2.out' }, t + 0.1);
          }
          if (i < lines.length - 1) {
            tl.to(words, { yPercent: -150, duration: 0.5, stagger: 0.03, ease: 'power2.in' }, t + 1.15);
          }
          // a próxima frase só entra quando a anterior já saiu (sem sobreposição de linhas)
          t += 1.75;
        });
        // profundidade: os planos derivam em velocidades diferentes durante todo o manifesto
        const span = t - 2.35 + 0.6;
        tl.fromTo([pieces[0], pieces[3]], { yPercent: 0 }, { yPercent: -7, duration: span, ease: 'none' }, 2.35);
        tl.fromTo([pieces[1], pieces[2]], { yPercent: 0 }, { yPercent: -20, duration: span, ease: 'none' }, 2.35);
        // pausa final: a composição montada permanece
        tl.to({}, { duration: 0.6 });
      });

      // ---------- mobile ----------
      mm.add(MQ.mobile, () => {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: q('.hero')[0], start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
          })
          .fromTo(q('.hero__frame'), { clipPath: archMobile }, { clipPath: archMobileOpen }, 0)
          .to(q('.hero__img'), { scale: 1.04 }, 0) // original de 1500px numa tela vertical: zoom mínimo
          .to(q('.hero__line--1'), { xPercent: -18 }, 0)
          .to(q('.hero__line--2'), { xPercent: 14, yPercent: 30 }, 0)
          .to(q('.hero__float--a'), { yPercent: 120, scale: 1.4 }, 0)
          .to(q('.hero__float--b'), { yPercent: -80 }, 0);

        q<HTMLElement>('.mline').forEach((line) => {
          gsap.fromTo(
            line.querySelectorAll('.w'),
            { yPercent: 115, y: 0 },
            {
              yPercent: 0,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: line, start: 'top 82%', end: 'top 45%', scrub: 0.5 },
            },
          );
          const piece = line.querySelector('.piece');
          if (piece)
            gsap.fromTo(
              piece,
              { yPercent: 25, rotate: 0 },
              { yPercent: -15, rotate: -3, ease: 'none', scrollTrigger: { trigger: line, start: 'top bottom', end: 'bottom top', scrub: true } },
            );
        });
      });

      return () => {
        stopIntro();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div className="opening" ref={root}>
      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero__name serif">
          <span className="hero__line hero__line--1">
            <span className="mask">
              <span className="w">Heloisa</span>
            </span>
          </span>{' '}
          <span className="hero__line hero__line--2">
            <span className="mask">
              <em className="w">Gavazzi</em>
            </span>
          </span>
        </h1>

        <div className="hero__frame-wrap">
          <div className="hero__frame">
            <Picture id={hero.img} alt={hero.alt} sizes="100vw" priority className="hero__img" position={hero.pos} />
          </div>
        </div>

        <div className="hero__float hero__float--a" aria-hidden="true">
          <Picture id="momentos/02-tacas" alt="" sizes="(min-width: 1024px) 12vw, 26vw" />
        </div>
        <div className="hero__float hero__float--b" aria-hidden="true">
          <Picture id="momentos/09-baloes-rosa" alt="" sizes="(min-width: 1024px) 10vw, 22vw" />
        </div>

        <p className="hero__meta hero__kicker label">
          <span>{hero.kicker}</span>
        </p>
        <p className="hero__meta hero__since label">
          <span>{hero.since}</span>
        </p>
        <p className="hero__meta hero__cue label" aria-hidden="true">
          <span>{hero.cue}</span>
          <i />
        </p>
      </section>

      <section className="manifesto" id="manifesto" aria-label="Manifesto">
        <p className="manifesto__eyebrow label">Por que fazemos festas</p>
        {manifesto.lines.map((line, i) => (
          <div className={`mline mline--${i}`} key={i}>
            <p className="mline__text serif">
              <Words text={line.text} emphasis={line.emphasis} />
            </p>
            {manifesto.pieces[i] && (
              <figure className={`piece piece--${i}`}>
                <Picture id={manifesto.pieces[i].img} alt={manifesto.pieces[i].alt} sizes="(min-width: 1024px) 35vw, 84vw" />
              </figure>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

/** arco da Hero no mobile/tablet — espelha o clip-path do CSS */
function archMobile() {
  const tablet = vw() >= 768;
  const side = vw() * (tablet ? 0.09 : 0.04);
  const r = vw() * (tablet ? 0.41 : 0.46);
  return `inset(${vh() * (tablet ? 0.13 : 0.15)}px ${side}px ${vh() * (tablet ? 0.04 : 0.03)}px ${side}px round ${r}px ${r}px 0px 0px)`;
}
/** no fim do scroll da Hero (mobile) a foto ocupa a tela inteira */
function archMobileOpen() {
  const r = vw() / 2;
  return `inset(0px 0px 0px 0px round ${r}px ${r}px 0px 0px)`;
}

/** porta em arco que nasce na base central da tela */
function portalStart() {
  const w = vw() * 0.12;
  const side = (vw() - w) / 2;
  return `inset(${vh()}px ${side}px 0px ${side}px round ${w / 2}px ${w / 2}px 0px 0px)`;
}
function portalMid() {
  const r = Math.min(vw() / 2, vh() * 0.9);
  return `inset(0px 0px 0px 0px round ${r}px ${r}px 0px 0px)`;
}

/** de onde cada peça "chega" (fração da viewport) */
const PIECE_FROM = [
  { x: -0.3, y: -0.3, r: -8 }, // superior esquerda
  { x: -0.3, y: 0.4, r: 7 }, // inferior esquerda
  { x: 0.35, y: -0.3, r: 8 }, // superior direita
  { x: 0.3, y: 0.4, r: -6 }, // inferior direita
];
