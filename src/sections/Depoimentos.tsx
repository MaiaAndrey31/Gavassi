import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { Words } from '../components/Words';
import { contact, depoimentos, palavraDaHeloisa } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import './depoimentos.css';

/**
 * DEPOIMENTOS — editorial, uma voz por viewport.
 * Enquanto não houver depoimentos reais em `content/site.ts`, a seção mostra a
 * fala real da própria Heloisa (sem inventar depoimentos) + link para os
 * feedbacks publicados no Instagram.
 * Scroll: as palavras "acendem" no ritmo da leitura; a foto tem parallax interno.
 */
export function Depoimentos() {
  const root = useRef<HTMLElement>(null);
  const hasReal = depoimentos.length > 0;
  const items = hasReal
    ? depoimentos.map((d) => ({ quote: d.quote, author: d.author, context: d.context, img: d.img ?? palavraDaHeloisa.img, alt: '' }))
    : [{ quote: palavraDaHeloisa.quote, author: palavraDaHeloisa.author, context: undefined, img: palavraDaHeloisa.img, alt: palavraDaHeloisa.alt }];

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        q<HTMLElement>('.depo').forEach((depo) => {
          gsap.fromTo(
            depo.querySelectorAll('.w'),
            { opacity: 0.14 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: 'none',
              scrollTrigger: { trigger: depo.querySelector('.depo__quote'), start: 'top 78%', end: 'bottom 45%', scrub: true },
            },
          );
          gsap.fromTo(
            depo.querySelector('.depo__media img'),
            { yPercent: -8, scale: 1.18 },
            { yPercent: 8, scale: 1.18, ease: 'none', scrollTrigger: { trigger: depo, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
          gsap.fromTo(
            depo.querySelector('.depo__media'),
            { clipPath: 'inset(18% 12% 0% 12% round 50% 50% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 50% 50% 0% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: depo, start: 'top 85%', end: 'top 20%', scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="depos section" id="depoimentos" aria-labelledby="depos-title" ref={root}>
      <h2 id="depos-title" className="label depos__eyebrow wrap">
        {hasReal ? 'Quem já viveu uma festa com a gente' : palavraDaHeloisa.label}
      </h2>
      {items.map((d, i) => (
        <figure className="depo wrap" key={i}>
          <div className="depo__media">
            <Picture id={d.img} alt={d.alt} sizes="(min-width: 1024px) 38vw, 80vw" position="50% 15%" />
          </div>
          <div className="depo__body">
            <blockquote className="depo__quote serif">
              <p>
                <span className="depo__mark" aria-hidden="true">
                  “
                </span>
                <Words text={d.quote} />
                <span className="depo__mark depo__mark--end" aria-hidden="true">
                  ”
                </span>
              </p>
            </blockquote>
            <figcaption className="depo__author">
              <span className="label">{d.author}</span>
              {d.context && <span className="label depo__context">{d.context}</span>}
            </figcaption>
            {!hasReal && (
              <a className="depo__link link-underline label" href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                {palavraDaHeloisa.feedbackCta}
              </a>
            )}
          </div>
        </figure>
      ))}
    </section>
  );
}
