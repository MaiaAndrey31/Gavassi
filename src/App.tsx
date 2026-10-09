import { useEffect } from 'react';
import { Cursor } from './components/Cursor';
import { Header } from './components/Header';
import { Preloader } from './components/Preloader';
import { ScrollTrigger } from './lib/gsap';
import { Cta } from './sections/Cta';
import { Depoimentos } from './sections/Depoimentos';
import { Festas } from './sections/Festas';
import { Footer } from './sections/Footer';
import { MomentosEspaco } from './sections/MomentosEspaco';
import { Opening } from './sections/Opening';
import { Servicos } from './sections/Servicos';
import { Trajetoria } from './sections/Trajetoria';
import './components/chrome.css';

/**
 * Narrativa: a festa se monta com o scroll.
 * Abertura (Hero → Manifesto) → Trajetória → Festas → Momentos → O Espaço
 * → Serviços → Depoimentos → CTA → Footer
 */
export default function App() {
  useEffect(() => {
    // fontes mudam métricas de texto: remedir pins depois que carregam
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Preloader />
      <Header />
      <main id="conteudo">
        <Opening />
        <Trajetoria />
        <Festas />
        <MomentosEspaco />
        <Servicos />
        <Depoimentos />
        <Cta />
      </main>
      <Footer />
      <Cursor />
    </>
  );
}
