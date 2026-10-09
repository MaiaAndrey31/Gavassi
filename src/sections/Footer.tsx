import { useRef } from 'react';
import { Picture } from '../components/Picture';
import { contact, footer } from '../content/site';
import { MQ, gsap, useGSAP } from '../lib/gsap';
import './footer.css';

/** FOOTER — a festa termina como começou: por uma janela em arco. */
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop}, ${MQ.mobile}`, () => {
        gsap.fromTo(
          q('.footer__window'),
          { clipPath: 'inset(30% 30% 0% 30% round 50% 50% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 50% 50% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 20%', scrub: true },
          },
        );
        gsap.fromTo(
          q('.footer__window img'),
          { scale: 1.3 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'bottom bottom', scrub: true } },
        );
        gsap.from(q('.footer__mark .w'), {
          yPercent: 110,
          duration: 1.3,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.footer__mark')[0], start: 'top 95%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const year = new Date().getFullYear();

  return (
    <footer className="footer" ref={root}>
      <div className="footer__top wrap">
        <div className="footer__window">
          <Picture id={footer.img} alt={footer.alt} sizes="(min-width: 1024px) 34vw, 80vw" />
        </div>
        <div className="footer__info">
          <p className="serif footer__signature">{footer.signature}</p>
          <nav className="footer__links" aria-label="Contato e redes">
            <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <span className="label">WhatsApp</span>
              <span className="link-underline">{contact.whatsappDisplay}</span>
            </a>
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
              <span className="label">Instagram</span>
              <span>
                <span className="link-underline">{contact.instagramHandle}</span> <span aria-hidden="true">↗</span>
              </span>
            </a>
            <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">
              <span className="label">Facebook</span>
              <span className="link-underline">Heloisa Gavazzi Festas</span>
            </a>
            <address className="footer__addr">
              <span className="label">{contact.city}</span>
              <span>
                {contact.address.street}
                <br />
                {contact.address.district}
              </span>
              <a className="label link-underline footer__route" href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                Como chegar <span aria-hidden="true">↗</span>
                <span className="sr-only"> (abre o Google Maps em nova aba)</span>
              </a>
            </address>
          </nav>
        </div>
      </div>

      <p className="footer__mark serif" aria-hidden="true">
        <span className="mask">
          <span className="w">Heloisa</span>
        </span>{' '}
        <span className="mask">
          <em className="w">Gavazzi</em>
        </span>
      </p>

      <div className="footer__base wrap label">
        <span>© {year} Heloisa Gavazzi</span>
        <a href="#inicio" className="link-underline">
          Voltar ao início
        </a>
      </div>
    </footer>
  );
}
