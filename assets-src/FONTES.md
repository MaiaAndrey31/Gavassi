# Origem das fotografias

Todas as fotos reais mostram o trabalho e o Espaço da Heloisa Gavazzi. Nenhuma contém criança identificável.
**Antes de publicar, confirmar com a Heloisa a autorização de uso / crédito do fotógrafo** das fotos da matéria.

## Fontes reais

| Código | Fonte | Resolução original | Conteúdo |
|---|---|---|---|
| Maps | Google Maps — foto publicada pelo perfil **"Espaço Heloísa Gavazzi"** (out/2024) | 3024×4032 | Salão: recreação + salão de festas ao fundo |
| Siga Mais | Especial publicitário "Com espaço completo, brinquedos e decoração, Heloisa Gavazzi é referência em festas infantis" — sigamais.com, 27/03/2025 | 1500×844 / 1080×1920 | Fachada, retrato da Heloisa, mesas postas (rosa/azul), decoração fundo do mar (2), recreação (2) |
| IG | Publicações públicas de @helogavazzi (visualização sem login) | **640px — baixa** | Safári, Frozen, lilás e rosa, rosa e pink, carrinho de doces |

As fotos IG são as maiores disponíveis sem login. **Substituir pelos arquivos originais** quando a Heloisa enviar.

## Mapa arquivo → fonte

| Arquivo | Fonte | Observação |
|---|---|---|
| hero/fundo-do-mar | Siga Mais | 1500px — pedir original em maior resolução (ideal ≥ 2400px) |
| manifesto/01-rosa-pink | IG | recorte |
| manifesto/02-fundo-do-mar-mesa | Siga Mais | recorte |
| manifesto/03-mesa-posta-rosa | Siga Mais | recorte |
| manifesto/04-fachada-arco | Siga Mais | recorte |
| trajetoria/01-comeco | **Unsplash (placeholder)** | aguardando foto histórica real |
| trajetoria/02-quinze-anos | **Unsplash (placeholder)** | aguardando foto histórica real |
| trajetoria/03-espaco-proprio | Siga Mais | |
| trajetoria/04-hoje | Siga Mais | retrato da Heloisa |
| festas/01-fundo-do-mar, 03-mesa-posta-rosa, 06-mesa-posta-azul | Siga Mais | |
| festas/02-safari, 04-frozen, 05-lilas-e-rosa, 07-rosa-e-pink | IG | 640px |
| momentos/* | Siga Mais + IG | recortes de detalhe |
| espaco/01-salao | Maps | |
| espaco/02-recreacao, 03-mesas | Siga Mais | |
| servicos/01 a 04 | Siga Mais + Maps | 03-buffet usa mesa posta (não há foto do buffet) |
| servicos/05-eventos-externos | **Unsplash (placeholder)** | aguardando foto de evento externo |
| depoimentos/fundo | Siga Mais | fachada |
| footer/baloes | Siga Mais | recorte |

## Encontradas e NÃO usadas — PENDENTE_AUTORIZACAO_IMAGEM

- IG (set/2026): crianças sentadas em frente à decoração rosa e pink (rostos identificáveis).
- IG (set/2026): Heloisa abraçando uma aniversariante (rosto da criança identificável) — **excelente para a Trajetória "Hoje"** se houver autorização.
- IG (set/2026): família com aniversariante e bolo da Branca de Neve.
- Siga Mais (capa): fachada com o nome de uma criança em letras gigantes ("MANU") — 600px, também descartada pela resolução.

## Processamento (passada de acabamento)

- Pipeline (`scripts/optimize-images.mjs`): perfis por grupo — grandes (Hero, Festas, Espaço, Trajetória, Depoimento) até 2560px, AVIF q60 4:4:4 / WebP q82; pequenas (Momentos, Manifesto, Serviços, Footer) até 1024px, AVIF q58 / WebP q80. Nunca amplia além do original. Nitidez leve (sigma 0,45) só quando há redução real.
- Fotos do Instagram (≤ 640px): +4% de contraste (sem alterar matiz/saturação), sem nitidez extra, qualidade de compressão maior. Em Festas ocupam área reduzida (máx. 640px de largura).
- Recortes refeitos: manifesto/01-rosa-pink, momentos/06-guardanapos-azuis, momentos/09-baloes-rosa.

## Limitadas pela resolução original (pedir arquivos maiores)

- hero/fundo-do-mar (1500px) — suave em telas ≥ 1920px e em celulares com tela de alta densidade (ideal: original da câmera, ≥ 3000px).
- espaco/02-recreacao e espaco/03-mesas (1500px) — suaves em telas ≥ 1920px.
- festas IG (640px): 02-safari, 04-frozen, 05-lilas-e-rosa, 07-rosa-e-pink; manifesto/01 e momentos/05, 09.
