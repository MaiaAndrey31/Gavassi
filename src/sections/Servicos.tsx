import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { servicos, whatsappLink } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import { getImage } from '../lib/images';
import './servicos.css';

/**
 * SERVIÇOS — lista editorial com expansão no hover (accordion editorial).
 *
 * Desktop com mouse (hover + ponteiro fino, sem reduced motion): a própria linha do serviço
 * cresce e revela, logo abaixo do título, uma fotografia grande — parte do fluxo do documento.
 * Só um item fica aberto por vez; a área inteira do item (título + foto + descrição) é o hover.
 * Clique = WhatsApp com a mensagem daquele serviço.
 *
 * Toque / sem hover / reduced motion: as fotografias ficam sempre visíveis entre título e descrição,
 * seguidas do "Conversar ↗". Nada depende do hover para existir.
 */
const HOVER = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CLOSED = 'inset(0% 0% 100% 0%)';
const OPEN = 'inset(0% 0% 0% 0%)';

const whatsappAbout = (service: string) =>
  whatsappLink(`Olá, Heloisa! Conheci o trabalho de vocês pelo site e gostaria de saber mais sobre: ${service}.`);

/** Cada container segue a proporção da própria foto (sem crop). Fotos verticais: no máximo 3:4. */
const ratioOf = (id: string) => {
  const { w, h } = getImage(id);
  return Math.max(w / h, 0.75).toFixed(4);
};

export function Servicos() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        gsap.from(q('.serv__rule'), {
          scaleX: 0,
          transformOrigin: '0 50%',
          duration: 1.4,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.serv__list')[0], start: 'top 80%' },
        });
        gsap.from(q('.serv__name .w'), {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.07,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.serv__list')[0], start: 'top 80%' },
        });
      });

      // ---------- expansão no hover ----------
      mm.add(HOVER, () => {
        const list = q<HTMLElement>('.serv__list')[0];
        const parts = q<HTMLElement>('.serv__item').map((li) => ({
          li,
          reveal: li.querySelector<HTMLElement>('.serv__media')!,
          inner: li.querySelector<HTMLElement>('.serv__media-inner')!,
          frame: li.querySelector<HTMLElement>('.serv__figure')!,
          img: li.querySelector<HTMLElement>('img')!,
          open: false,
        }));
        type Part = (typeof parts)[number];

        gsap.set(parts.map((p) => p.reveal), { height: 0 });
        gsap.set(parts.map((p) => p.frame), { clipPath: CLOSED });
        gsap.set(parts.map((p) => p.img), { scale: 1.04 });

        // fotos ocultas não disparam o lazy nativo: busca antes de a lista chegar (sem pesar no carregamento inicial)
        const io = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            list.querySelectorAll<HTMLImageElement>('img').forEach((img) => (img.loading = 'eager'));
            io.disconnect();
          },
          { rootMargin: '100% 0px' },
        );
        io.observe(list);

        const openItem = (p: Part) => {
          p.open = true;
          p.li.classList.add('is-on');
          gsap.killTweensOf([p.reveal, p.frame, p.img]);
          gsap.to(p.reveal, {
            height: p.inner.offsetHeight,
            duration: 0.85,
            ease: 'power3.inOut',
            onComplete: () => {
              gsap.set(p.reveal, { height: 'auto' }); // acompanha resize enquanto aberto
            },
          });
          gsap.to(p.frame, { clipPath: OPEN, duration: 0.9, ease: 'power3.inOut', delay: 0.06 });
          gsap.to(p.img, { scale: 1, duration: 1.3, ease: 'power3.out', delay: 0.06 });
        };

        const closeItem = (p: Part) => {
          p.open = false;
          p.li.classList.remove('is-on');
          gsap.killTweensOf([p.reveal, p.frame, p.img]);
          gsap.set(p.reveal, { height: p.reveal.offsetHeight }); // de 'auto' para px, para poder animar
          gsap.to(p.frame, { clipPath: CLOSED, duration: 0.5, ease: 'power2.inOut' });
          gsap.to(p.img, { scale: 1.04, duration: 0.7, ease: 'power2.inOut' });
          gsap.to(p.reveal, { height: 0, duration: 0.75, ease: 'power3.inOut', delay: 0.05 });
        };

        let current: number | null = null;
        let timer = 0;
        let pointerInside = false;

        // um aberto por vez: o anterior fecha enquanto o novo abre
        const setActive = (next: number | null) => {
          if (next === current) return;
          current = next;
          parts.forEach((p, k) => {
            if (k === next) openItem(p);
            else if (p.open) closeItem(p);
          });
        };

        const cleanups: Array<() => void> = [];
        const on = <T extends EventTarget>(el: T, type: string, fn: (e: never) => void) => {
          el.addEventListener(type, fn as EventListener);
          cleanups.push(() => el.removeEventListener(type, fn as EventListener));
        };

        parts.forEach((p, k) => {
          // intenção de hover: evita abrir/fechar quando o mouse apenas atravessa a lista
          on(p.li, 'pointerenter', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            clearTimeout(timer);
            timer = window.setTimeout(() => setActive(k), current === null ? 70 : 120);
          });
          on(p.li, 'pointerleave', () => clearTimeout(timer));
          // teclado: foco visível abre, como no hover
          on(p.li, 'focusin', (e: FocusEvent) => {
            if (!(e.target as HTMLElement).matches(':focus-visible')) return;
            clearTimeout(timer);
            setActive(k);
          });
        });
        on(list, 'pointerenter', () => (pointerInside = true));
        on(list, 'pointerleave', () => {
          pointerInside = false;
          clearTimeout(timer);
          setActive(null);
        });
        on(list, 'focusout', (e: FocusEvent) => {
          if (!pointerInside && !list.contains(e.relatedTarget as Node | null)) setActive(null);
        });

        return () => {
          clearTimeout(timer);
          io.disconnect();
          cleanups.forEach((fn) => fn());
          parts.forEach((p) => p.li.classList.remove('is-on'));
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="serv section wrap" id="servicos" aria-labelledby="serv-title" ref={root}>
      <header className="serv__head">
        <p className="label serv__eyebrow">Serviços</p>
        <h2 id="serv-title" className="serif serv__title">
          {servicos.title}
        </h2>
      </header>

      <ul className="serv__list">
        {servicos.items.map((s) => (
          <li key={s.n} className="serv__item">
            <a className="serv__link" href={whatsappAbout(s.name)} target="_blank" rel="noopener noreferrer" data-cursor="Conversar">
              <span className="serv__rule" aria-hidden="true" />
              <span className="serv__n label">{s.n}</span>
              <h3 className="serv__name serif">
                <span className="mask">
                  <span className="w">{s.name}</span>
                </span>
              </h3>
              <div className="serv__media">
                <div className="serv__media-inner">
                  <figure className="serv__figure" style={{ ['--ar' as string]: ratioOf(s.img) }}>
                    <Picture id={s.img} alt={s.alt} sizes="(min-width: 1024px) 52vw, (min-width: 768px) 44rem, 92vw" position={s.pos} />
                  </figure>
                </div>
              </div>
              <p className="serv__text">{s.text}</p>
              <span className="serv__cta label" aria-hidden="true">
                <span className="serv__cta-text">Conversar</span>
                <svg className="serv__arrow" viewBox="0 0 24 24">
                  <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </span>
              <span className="sr-only"> — conversar pelo WhatsApp (abre em nova aba)</span>
            </a>
          </li>
        ))}
        <li className="serv__rule serv__rule--end" aria-hidden="true" />
      </ul>
    </section>
  );
}
