import { useRef } from 'react';
import { contact } from '../content/site';
import { ScrollTrigger, useGSAP } from '../lib/gsap';

const NAV = [
  { href: '#trajetoria', label: 'História' },
  { href: '#festas', label: 'Festas' },
  { href: '#momentos', label: 'O Espaço' },
  { href: '#servicos', label: 'Serviços' },
];

/**
 * Cabeçalho mínimo + botão flutuante de WhatsApp.
 * O cabeçalho recolhe ao rolar para baixo e volta ao rolar para cima.
 * O botão flutuante aparece depois da abertura e some quando o CTA está na tela.
 */
export function Header() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const header = root.current!.querySelector('.header')!;
      const float = root.current!.querySelector('.wa-float')!;

      const hide = ScrollTrigger.create({
        refreshPriority: -1,
        start: 'top top-=120',
        end: 'max',
        onUpdate: (self) => header.classList.toggle('is-hidden', self.direction === 1),
        onLeaveBack: () => header.classList.remove('is-hidden'),
      });

      const show = ScrollTrigger.create({
        refreshPriority: -1,
        trigger: document.getElementById('trajetoria'),
        start: 'top 60%',
        endTrigger: document.getElementById('contato'),
        end: 'top 80%',
        toggleClass: { targets: float, className: 'is-visible' },
      });

      return () => {
        hide.kill();
        show.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <header className="header">
        <a className="header__brand" href="#inicio" aria-label="Heloisa Gavazzi — início">
          <span className="serif">H</span>
          <em className="serif">G</em>
        </a>
        <nav className="header__nav" aria-label="Seções">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="label">
              {n.label}
            </a>
          ))}
        </nav>
        <a className="header__cta label" href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" data-cursor="WhatsApp">
          Planejar festa
        </a>
      </header>

      <a className="wa-float" href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${contact.whatsappDisplay}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2l-.5-.3Z"
          />
        </svg>
        <span className="label">WhatsApp</span>
      </a>
    </div>
  );
}
