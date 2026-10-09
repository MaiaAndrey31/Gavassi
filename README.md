# Heloisa Gavazzi — site institucional

Conceito: **"A festa se monta com o scroll."** React + Vite + GSAP/ScrollTrigger + Three.js (só no CTA).

## Comandos

```bash
npm run dev       # desenvolvimento (http://localhost:5173)
npm run build     # typecheck + build + pré-render do HTML (SEO/LCP)
npm run preview   # serve o build
npm run images    # (re)gera imagens otimizadas a partir de assets-src/
```

## Onde mexer

| O quê | Onde |
|---|---|
| Textos, contatos, depoimentos, nomes de temas | `src/content/site.ts` (itens provisórios marcados `// PLACEHOLDER`) |
| Fotos | `assets-src/<seção>/` → rode `npm run images` (origem de cada foto em `assets-src/FONTES.md`) |
| Domínio (canonical, OG, sitemap, robots) | `.env` → `VITE_SITE_URL` + `VITE_SITE_CONFIRMED` (**provisório**: enquanto `false`, o build não publica canonical/og:url/sitemap) |
| Dados estruturados / meta tags | `index.html` |

### Trocar uma foto provisória
1. Substitua o arquivo em `assets-src/` **mantendo o mesmo nome** (ex.: `assets-src/festas/01-arco-rose.jpg`).
2. `npm run images` — gera AVIF/WebP nas larguras do perfil do grupo (grandes: até 2560px; pequenas: até 1024px, nunca acima do original), cor dominante e LQIP em `public/img/` e `src/content/images.generated.json`.
   Enquadramento por foto/breakpoint: campo `pos` em `src/content/site.ts` (string ou `{ base, md, lg, xl }`).
3. Atualize o `alt` correspondente em `src/content/site.ts`.

Para trocar a foto da Hero por outra com nome diferente, atualize também `HERO` em `vite.config.ts` (preload do LCP).

### Depoimentos
`depoimentos` em `src/content/site.ts` está vazio de propósito. Ao preencher com depoimentos reais (e autorizados), a seção passa a exibi-los automaticamente.

## Estrutura

```
assets-src/          fotos originais por seção (fonte)
public/img/          fotos otimizadas (gerado)
public/fonts/        Fraunces (soft) + Inter Tight — subset latino, OFL
scripts/             otimização de imagens e pré-render
src/content/         conteúdo + manifesto de imagens
src/lib/             gsap (variantes de movimento), imagens, sinal de intro
src/components/      Picture, Words, Preloader, Header, Cursor
src/sections/        Opening (Hero+Manifesto), Trajetoria, Festas, MomentosEspaco,
                     Servicos, Depoimentos, Cta, Footer — cada uma com seu CSS
src/three/           balões de luz (Three.js, carregado sob demanda)
```

## Movimento

Todas as animações vivem em `gsap.matchMedia()` com três variantes (`src/lib/gsap.ts`):
- **desktop** (≥1024px, sem reduced motion): pins, scrub e composições completas;
- **mobile**: scroll nativo, scrub curto, sem pin longo, carrossel com snap, sticky nativo;
- **reduce**: tudo estático e visível.

O CSS usa as mesmas condições, então o layout em camadas só existe quando o JS de movimento também existe.
