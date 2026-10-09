import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { contact, espaco, momentos } from '../content/site';
import { MQ, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';
import { getImage } from '../lib/images';
import { useEagerNear } from '../lib/useEagerNear';
import './momentos.css';
import './espaco.css';

/**
 * MOMENTOS → O ESPAÇO (um capítulo contínuo)
 *
 * Momentos é uma pilha fotográfica central: a cada trecho de scroll uma foto é revelada (clip-path
 * ligado ao scroll) SOBRE as anteriores, em seu formato natural, com deslocamentos mínimos — memórias
 * sendo colocadas sobre a mesa. A última camada é a foto do salão: ela nasce na pilha (formato natural),
 * cresce e assume a tela inteira exatamente como a primeira cena do Espaço — e a troca acontece sem emenda.
 *
 * Desktop: um único palco fixado (GSAP pin) para Momentos + Espaço; a camada de Momentos sai quando a
 *          foto do salão já é idêntica à cena por baixo.
 * Mobile/tablet: palco sticky nativo; o Espaço sobe por cima com a cena 1 oculta até o ponto exato da troca.
 * Reduced motion: sequência vertical simples; nenhuma máscara, nenhum pin.
 */

type Reveal = 'center' | 'ltr' | 'rtl';
const CLOSED: Record<Reveal, string> = {
  center: 'inset(0% 50% 0% 50%)', // do centro para as laterais (predominante)
  ltr: 'inset(0% 100% 0% 0%)',
  rtl: 'inset(0% 0% 0% 100%)',
};
const OPEN = 'inset(0% 0% 0% 0%)';

/** pose final de cada foto na pilha (px / graus): o suficiente para ver as anteriores atrás */
const POSE: { x: number; y: number; r: number; reveal: Reveal }[] = [
  { x: -28, y: 14, r: -2, reveal: 'center' },
  { x: 24, y: -12, r: 1.6, reveal: 'ltr' },
  { x: -14, y: 18, r: -1.1, reveal: 'center' },
  { x: 20, y: -6, r: 1.2, reveal: 'rtl' },
  { x: -8, y: 10, r: -0.6, reveal: 'center' },
];

/**
 * Geometria do palco — espelha o CSS (momentos.css, unidades cq do palco):
 * largura da foto = min(maxW, maxH × proporção, largura natural); centro em (50%, cy).
 */
const LAYOUT = {
  // telas baixas (≤ 800px de altura): fotos um pouco menores e centro mais alto, para não encostar no subtítulo
  desktop: {
    cy: (h: number) => (h <= 800 ? 0.56 : 0.57),
    maxW: (w: number) => Math.min(w * 0.56, 900),
    maxH: (h: number) => h * (h <= 800 ? 0.62 : 0.68),
    motion: 1,
  },
  mobile: { cy: () => 0.55, maxW: (w: number) => w * 0.86, maxH: (h: number) => h * 0.58, motion: 0.4 },
};
type Layout = {
  cy: (h: number) => number;
  maxW: (w: number) => number;
  maxH: (h: number) => number;
  motion: number;
};

/** ritmo (unidades da timeline): uma foto a cada STEP, cada uma levando DUR para abrir */
const T0 = 0.2;
const STEP = 0.9;
const DUR = 1.0;
const FIN = T0 + STEP * momentos.items.length; // a foto do salão entra como última camada
const E0 = FIN + 1.4; // começo da expansão do salão

// Desktop: a transição para o Espaço (fases originais) é deslocada para depois da expansão.
const E_DUR = 1.6;
const SWAP = E0 + E_DUR + 0.02; // a camada de Momentos sai: a foto já é idêntica à cena por baixo
const S = SWAP - 2.56;
const UNIT_VH = 0.842; // vh de scroll por unidade (mantém o ritmo das cenas do Espaço)

/** no mobile/tablet, fotos horizontais não são forçadas em tela cheia vertical (ver espaco.css) */
const orient = (id: string) => (getImage(id).w > getImage(id).h ? 'landscape' : 'portrait');

const centerScene = espaco.scenes[0];
const SALAO = getImage(centerScene.img);
const [POS_X, POS_Y] = String(centerScene.pos)
  .split(' ')
  .map((v) => parseFloat(v) / 100);

export function MomentosEspaco() {
  const root = useRef<HTMLDivElement>(null);
  useEagerNear(root);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      /**
       * Monta a pilha + a foto final numa timeline. Devolve nada; as posições são as constantes acima.
       * A foto do salão é um elemento do tamanho "cover" da cena do Espaço (CSS), reduzido por transform
       * até o formato natural na pilha; a máscara (clip-path em px do palco) acompanha. Na expansão,
       * máscara → tela inteira e transform → posição/escala da cena: sem salto de proporção.
       */
      const buildMomentos = (tl: gsap.core.Timeline, L: Layout, eDur: number) => {
        const stage = q<HTMLElement>('.momentos__stage')[0];
        const items = q<HTMLElement>('.mstack__item');
        const finalWrap = q<HTMLElement>('.mfinal')[0];
        const finalImg = q<HTMLElement>('.mfinal__img')[0];
        const k = L.motion;

        const geo = () => {
          const W = stage.clientWidth;
          const H = stage.clientHeight;
          const ar = SALAO.w / SALAO.h;
          const Wb = Math.max(W, H * ar); // tamanho "cover" (igual à cena do Espaço)
          const Hb = Wb / ar;
          const Wa = Math.min(L.maxW(W), L.maxH(H) * ar); // formato natural, na pilha
          const Ha = Wa / ar;
          const cx = W / 2;
          const cy = L.cy(H) * H;
          return {
            ka: Wa / Wb,
            xa: cx - Wb / 2,
            ya: cy - Hb / 2,
            xb: (W - Wb) * POS_X,
            yb: (H - Hb) * POS_Y,
            rectA: `inset(${cy - Ha / 2}px ${W - cx - Wa / 2}px ${H - cy - Ha / 2}px ${cx - Wa / 2}px)`,
            slitA: `inset(${cy - Ha / 2}px ${W - cx}px ${H - cy - Ha / 2}px ${cx}px)`,
          };
        };

        // centralização explícita (o GSAP absorve a propriedade CSS `translate` e a zera)
        gsap.set(items, { xPercent: -50, yPercent: -50 });

        // 1 · as memórias são colocadas uma sobre a outra
        items.forEach((el, i) => {
          const p = POSE[i];
          const t = T0 + STEP * i;
          const tilt = p.r + (p.r >= 0 ? 2 : -2);
          tl.fromTo(el, { clipPath: CLOSED[p.reveal] }, { clipPath: OPEN, duration: DUR, ease: 'none' }, t);
          tl.fromTo(
            el,
            { x: p.x * k, y: p.y * k + 30 * k, rotation: tilt * k, scale: 0.96 },
            { x: p.x * k, y: p.y * k, rotation: p.r * k, scale: 1, duration: DUR, ease: 'power2.out' },
            t,
          );
          tl.fromTo(el.querySelector('img'), { scale: 1.06 }, { scale: 1, duration: DUR * 1.1, ease: 'power1.out' }, t);
        });

        // título perde protagonismo aos poucos; subtítulo dá lugar às fotos
        tl.fromTo(q('.momentos__title'), { y: 0, opacity: 1 }, { y: -18, opacity: 0.45, duration: 2.6 }, 0.9)
          .fromTo(q('.momentos__sub'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.6 }, 1.0);

        // 2 · a última camada: o salão, centrado, sem rotação
        tl.fromTo(finalWrap, { clipPath: () => geo().slitA }, { clipPath: () => geo().rectA, duration: 1.1, ease: 'none' }, FIN)
          .fromTo(
            finalImg,
            { x: () => geo().xa, y: () => geo().ya + 30 * k, scale: () => geo().ka * 0.96 },
            { x: () => geo().xa, y: () => geo().ya, scale: () => geo().ka, duration: 1.1, ease: 'power2.out' },
            FIN,
          )
          // as anteriores recuam e perdem protagonismo
          .to(items, { opacity: 0.38, scale: 0.97, duration: 0.8, ease: 'power1.inOut' }, FIN + 0.1)
          .to(q('.momentos__title'), { opacity: 0, y: -40, duration: 0.45, ease: 'power2.in' }, E0 - 0.35)

          // 3 · o salão cresce e assume a tela — mesma posição/escala da cena do Espaço
          // fromTo explícito: o valor computado do navegador vem abreviado (3 valores) e quebraria a interpolação
          .fromTo(finalWrap, { clipPath: () => geo().rectA }, { clipPath: 'inset(0px 0px 0px 0px)', duration: eDur, ease: 'power2.inOut', immediateRender: false }, E0)
          .to(finalImg, { x: () => geo().xb, y: () => geo().yb, scale: 1, duration: eDur, ease: 'power2.inOut' }, E0)
          .to(items, { opacity: 0, scale: 0.94, duration: 0.8, ease: 'power2.in' }, E0);
      };

      // título e subtítulo chegam com a seção (antes do pin/sticky)
      const entrance = (trigger: Element) => {
        gsap.fromTo(
          q('.momentos__title .w'),
          { autoAlpha: 0, yPercent: 35 },
          { autoAlpha: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger, start: 'top 80%', end: 'top 25%', scrub: true } },
        );
        gsap.fromTo(
          q('.momentos__sub-in'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, ease: 'none', scrollTrigger: { trigger, start: 'top 60%', end: 'top 5%', scrub: true } },
        );
      };

      // ---------------- desktop: palco único fixado ----------------
      mm.add(MQ.desktop, () => {
        const vh = () => window.innerHeight;
        const scenes = q<HTMLElement>('.escena');
        const captions = q<HTMLElement>('.escena__caption');

        gsap.set(scenes.slice(1), { clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' });
        gsap.set(captions.map((c) => c.querySelectorAll('.reveal')), { yPercent: 110, autoAlpha: 0 });
        gsap.set(q('.espaco__head .reveal'), { yPercent: 110 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + vh() * (7.6 + S) * UNIT_VH,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });
        entrance(root.current!);
        buildMomentos(tl, LAYOUT.desktop, E_DUR);

        // O Espaço: a camada de cima sai sem emenda (a mesma foto, na mesma posição, está por baixo).
        // Sombras e textos da cena só entram DEPOIS da troca — no instante da troca a imagem é idêntica.
        gsap.set(scenes[0], { '--shade': 0 });
        gsap.set(q('.espaco__count'), { autoAlpha: 0 });
        tl.set(q('.momentos'), { autoAlpha: 0 }, SWAP)
          .to(scenes[0], { '--shade': 1, duration: 0.7 }, SWAP + 0.02)
          .to(q('.espaco__count'), { autoAlpha: 1, duration: 0.6 }, SWAP + 0.1)
          .to(q('.espaco__shade'), { opacity: 1, duration: 0.7 }, SWAP + 0.02)
          .to(q('.espaco__head .reveal'), { yPercent: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, SWAP + 0.02);

        let at = 2.7 + S;
        scenes.forEach((scene, i) => {
          const img = scene.querySelector('img');
          if (i > 0) {
            tl.fromTo(scene, { clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, at);
            tl.to(captions[i - 1].querySelectorAll('.reveal'), { yPercent: -110, autoAlpha: 0, duration: 0.4, stagger: 0.04, ease: 'power2.in' }, at);
            if (i === 1) tl.to(q('.espaco__head .reveal'), { yPercent: -110, duration: 0.45, stagger: 0.04, ease: 'power2.in' }, at);
          }
          tl.to(captions[i].querySelectorAll('.reveal'), { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, at + (i ? 0.55 : 0.1));
          // a câmera percorre o ambiente — a foto de 3024px (cena 1) aguenta mais zoom que as de 1500px
          tl.fromTo(
            img,
            { scale: i ? 1.07 : 1, xPercent: 0 },
            { scale: i ? 1.02 : 1.08, xPercent: i ? (i % 2 ? 0.8 : -0.8) : -3, duration: 1.9 },
            at,
          );
          tl.to(q('.espaco__count-track'), { yPercent: (-100 / scenes.length) * i, duration: 0.5, ease: 'power2.inOut' }, at + 0.3);
          at += 1.3;
        });
        tl.to({}, { duration: 0.4 });
      });

      // ---------------- mobile/tablet: palco sticky nativo ----------------
      mm.add(MQ.mobile, () => {
        const section = q<HTMLElement>('.momentos')[0];
        const stage = q<HTMLElement>('.momentos__stage')[0];
        const espacoEl = q<HTMLElement>('.espaco')[0];
        const scenes = q<HTMLElement>('.escena');
        const first = scenes[0];

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
        });
        entrance(section);
        buildMomentos(tl, LAYOUT.mobile, 1.4);
        tl.to({}, { duration: 0.5 }); // a foto já cobre a tela antes do fim do trecho (folga para o scrub)

        // troca exata: o Espaço (margem −100svh) encosta no topo quando o palco está no último quadro
        const swap = (on: boolean) => {
          gsap.set(first, { visibility: on ? 'visible' : 'hidden' });
          gsap.set(stage, { visibility: on ? 'hidden' : 'visible' });
        };
        swap(false);
        const st = ScrollTrigger.create({ trigger: espacoEl, start: 'top top', onEnter: () => swap(true), onLeaveBack: () => swap(false) });

        // depois da troca, o texto do Espaço entra sobre a foto
        const after = { trigger: espacoEl, start: 'top top', end: () => '+=' + window.innerHeight * 0.3, scrub: true };
        gsap.fromTo(q('.espaco__head'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, ease: 'none', scrollTrigger: after });
        gsap.fromTo(first.querySelector('.escena__caption'), { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: after });
        gsap.fromTo(first, { '--shade': 0 }, { '--shade': 1, ease: 'none', scrollTrigger: after });

        scenes.slice(1).forEach((scene) => {
          gsap.fromTo(
            scene.querySelector('img'),
            { scale: 1.06 },
            { scale: 1, ease: 'none', scrollTrigger: { trigger: scene, start: 'top bottom', end: 'top top', scrub: true } },
          );
        });

        return () => {
          st.kill();
          gsap.set([first, stage], { clearProps: 'visibility' });
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="gather" ref={root}>
      <section className="momentos section" id="momentos" aria-labelledby="momentos-title">
        <div className="momentos__stage">
          <header className="momentos__head">
            <h2 id="momentos-title" className="serif momentos__title">
              <span className="mask">
                <span className="w">{momentos.title}</span>
              </span>
            </h2>
          </header>
          <p className="momentos__sub lead">
            <span className="momentos__sub-in">{momentos.subtitle}</span>
          </p>

          {/* pilha: cada foto no formato natural, uma sobre a outra (z-index crescente) */}
          <div className="mstack">
            {momentos.items.map((m, i) => {
              const { w, h } = getImage(m.img);
              return (
                <figure
                  key={m.img}
                  className="mstack__item"
                  style={{ ['--ar' as string]: (w / h).toFixed(4), ['--nw' as string]: `${w}px`, zIndex: i + 1 }}
                >
                  <Picture id={m.img} alt={m.alt} sizes="(min-width: 1024px) 56vw, 86vw" />
                </figure>
              );
            })}
          </div>

          {/* última camada: o salão — cresce até virar a primeira cena do Espaço */}
          <div className="mfinal" aria-hidden="true" style={{ zIndex: momentos.items.length + 1 }}>
            <div className="mfinal__img" style={{ ['--ar' as string]: (SALAO.w / SALAO.h).toFixed(4) }}>
              <Picture id={centerScene.img} alt="" sizes="100vw" />
            </div>
          </div>
        </div>
      </section>

      <section className="espaco section" id="espaco" aria-labelledby="espaco-title">
        <div className="espaco__scenes">
          {espaco.scenes.map((sc, i) => (
            <article className="escena" key={sc.img} style={{ zIndex: i + 1 }} data-orient={orient(sc.img)}>
              <div className="escena__media">
                <Picture id={sc.img} alt={sc.alt} sizes="100vw" position={sc.pos} />
              </div>
              <div className="escena__caption">
                <p className="label escena__n reveal">
                  {String(i + 1).padStart(2, '0')} — {String(espaco.scenes.length).padStart(2, '0')}
                </p>
                <h3 className="serif escena__title reveal">{sc.title}</h3>
                <ul className="escena__items">
                  {sc.items.map((it) => (
                    <li className="label reveal" key={it}>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          <div className="espaco__shade" aria-hidden="true" />
        </div>

        <header className="espaco__head">
          <p className="label">
            <span className="mask">
              <span className="reveal">{contact.city}</span>
            </span>
          </p>
          <h2 id="espaco-title" className="serif espaco__title">
            <span className="mask">
              <span className="reveal">{espaco.title.split(' ')[0]}</span>
            </span>{' '}
            <span className="mask">
              <em className="reveal">{espaco.title.split(' ').slice(1).join(' ')}</em>
            </span>
          </h2>
          <p className="espaco__lead">
            <span className="mask">
              <span className="reveal">{espaco.lead}</span>
            </span>
          </p>
          <address className="espaco__addr">
            <span className="mask">
              <span className="reveal">
                {contact.address.street}
                <br />
                {contact.address.district}
              </span>
            </span>
            <span className="mask">
              <a className="reveal label espaco__route" href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" data-cursor="Mapa">
                Como chegar <span aria-hidden="true">↗</span>
                <span className="sr-only"> (abre o Google Maps em nova aba)</span>
              </a>
            </span>
          </address>
        </header>

        <div className="espaco__count label" aria-hidden="true">
          <div className="espaco__count-win">
            <div className="espaco__count-track">
              {espaco.scenes.map((_, i) => (
                <span key={i}>{String(i + 1).padStart(2, '0')}</span>
              ))}
            </div>
          </div>
          <span>/ {String(espaco.scenes.length).padStart(2, '0')}</span>
        </div>
      </section>
    </div>
  );
}
