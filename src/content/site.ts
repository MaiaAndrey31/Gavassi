/**
 * CONTEÚDO DO SITE — fonte única de textos, contatos e imagens.
 *
 * Convenções:
 *  - `img`: chave da imagem = caminho dentro de /assets-src sem extensão.
 *    Para trocar uma foto, substitua o arquivo em assets-src e rode `npm run images`.
 *  - Itens marcados com `// PLACEHOLDER` são provisórios e devem ser substituídos
 *    por material real da Heloisa antes da publicação.
 *  - Informações NÃO confirmadas (nº de temas, preços, horário) foram omitidas de propósito.
 *    Não adicionar sem confirmação da cliente. Não misturar com a Chácara Brasil (outro espaço).
 */

const WHATSAPP_NUMBER = '5518997046013';
const WHATSAPP_MESSAGE =
  'Olá, Heloisa! Conheci o trabalho de vocês pelo site e gostaria de conversar sobre a festa do meu filho(a).';

export const whatsappLink = (message = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const contact = {
  whatsappDisplay: '(18) 99704-6013',
  whatsappUrl: whatsappLink(),
  instagramHandle: '@helogavazzi',
  instagramUrl: 'https://www.instagram.com/helogavazzi/',
  facebookUrl: 'https://www.facebook.com/heloisagavazzifestasinfantis/',
  city: 'Adamantina — SP',
  // Endereço CONFIRMADO pela cliente (Espaço Heloísa Gavazzi).
  // Atenção: R. Mário de Andrade, 80 é da Chácara Brasil — NÃO é o endereço do Espaço.
  address: {
    street: 'R. Tsunekishi Sakai, 127',
    district: 'Vila Joaquim',
    city: 'Adamantina',
    state: 'SP',
    postalCode: '17800-000',
  },
  // Ficha oficial do Espaço no Google Maps (abre em nova aba)
  mapsUrl:
    'https://www.google.com/maps/place/Espa%C3%A7o+Helo%C3%ADsa+Gavazzi/@-21.6812482,-51.0779056,17z/data=!4m6!3m5!1s0x9496a344b3018f65:0xc92d24f71663867a!8m2!3d-21.6812482!4d-51.0779056!16s%2Fg%2F11sv2hfq2v',
};

/*
 * FOTOS REAIS — origem documentada em assets-src/FONTES.md.
 *   [Siga Mais]  fotos do especial publicitário sobre o Espaço (27/03/2025)
 *   [Maps]       foto publicada pelo perfil "Espaço Heloísa Gavazzi" no Google Maps
 *   [IG]         publicações públicas do @helogavazzi (640px — substituir pelos originais em alta)
 * `pos` = object-position (enquadramento) para a foto funcionar na máscara da seção.
 */

export const hero = {
  img: 'hero/fundo-do-mar', // REAL [Siga Mais] — decoração "fundo do mar" no Espaço
  alt: 'Decoração de festa com tema fundo do mar: arco de balões em tons pastel, painel em arco rosa, bolo e personagens marinhos',
  pos: '50% 55%',
  kicker: 'Festas infantis · Adamantina — SP',
  since: 'Desde 2011',
  cue: 'Role para montar a festa',
};

/** Cada frase entra com o scroll. Cada "peça" é um elemento da festa que se soma à composição. */
export const manifesto = {
  lines: [
    { text: 'Toda criança merece uma festa.', emphasis: 'festa' },
    { text: 'Montada à mão,', emphasis: 'mão' },
    { text: 'detalhe por detalhe.', emphasis: 'detalhe' },
    { text: 'Há 15 anos, em Adamantina.', emphasis: '15 anos' },
  ],
  pieces: [
    { img: 'manifesto/01-rosa-pink', alt: 'Mesa posta com toalha azul, guardanapos dobrados e taças no salão decorado' }, // REAL [Siga Mais] — recorte em alta (arquivo mantém o nome antigo)
    { img: 'manifesto/02-fundo-do-mar-mesa', alt: 'Mesa de doces com polvos, sereia e corais da decoração fundo do mar' }, // REAL [Siga Mais]
    { img: 'manifesto/03-mesa-posta-rosa', alt: 'Prato com sousplat de bolinhas e guardanapo rosa dobrado à mão' }, // REAL [Siga Mais]
    { img: 'manifesto/04-fachada-arco', alt: 'Fachada do Espaço Heloisa Gavazzi com arco de balões na entrada' }, // REAL [Siga Mais]
  ],
};

/**
 * Trajetória — datas confirmadas: empresa desde 2011 (CNPJ), 15 anos de decoração, espaço próprio.
 * Citações (`quote`) são falas literais da Heloisa publicadas no portal Siga Mais (27/03/2025).
 * Capítulos 2011 e 15 anos: aguardando FOTOS HISTÓRICAS reais (não usar foto recente fingindo ser antiga).
 */
/**
 * `frame` (opcional): proporção do container para fotos em que a composição original importa
 * (retratos). O container se adapta à foto — em vez de a foto ser cortada para caber.
 * Valores = largura / altura. Foto original do retrato da Heloisa: 1080×1920 (9:16 = 0,5625).
 */
type Chapter = {
  mark: string;
  label: string;
  title: string;
  quote: string;
  img: string;
  alt: string;
  pos: string;
  frame?: { desktop: number; tablet: number; mobile: number };
};

export const trajetoria: { title: string; chapters: Chapter[] } = {
  title: 'Uma história contada em festas',
  chapters: [
    {
      mark: '2011',
      label: 'começou em casa',
      title: 'As festas dos meus filhos',
      quote: 'Comecei com a montagem das festas das minhas crianças, depois com a montagem das festas de primos, e isso foi se expandindo.',
      img: 'trajetoria/01-comeco', // PLACEHOLDER (Unsplash) — pedir foto antiga, das primeiras festas
      alt: 'Balões em tons pastel contra o céu',
      pos: '50% 50%',
    },
    {
      mark: '15',
      label: 'anos de história',
      title: 'Uma festa de cada vez',
      quote: 'Passado algum tempo saí do meu trabalho na área de RH e fiquei só com as festas.',
      img: 'trajetoria/02-quinze-anos', // PLACEHOLDER (Unsplash) — pedir foto de uma festa antiga
      alt: 'Mesa com bolo e cupcakes decorados em verde',
      pos: '50% 50%',
    },
    {
      mark: 'Casa',
      label: 'espaço próprio',
      title: 'Um salão colorido e completo',
      quote: 'Hoje temos essa estrutura, e minha realização é essa, ver meu salão colorido e completo, as crianças dando vida a esse espaço.',
      img: 'trajetoria/03-espaco-proprio', // REAL [Siga Mais]
      alt: 'Área de recreação colorida do Espaço, com fliperamas, mesa de air hockey e brinquedão',
      pos: '62% 50%',
    },
    {
      mark: 'Hoje',
      label: 'no espaço e fora dele',
      title: 'Com a Heloisa por perto',
      quote: '…toda a nossa dedicação, carinho e responsabilidade para transformar um sonho em realidade.',
      img: 'trajetoria/04-hoje', // REAL [Siga Mais] — retrato da Heloisa no Espaço
      alt: 'Heloisa Gavazzi sorrindo, sentada na área de recreação do Espaço',
      pos: '50% 0%', // ancora no topo: cabeça e cabelo inteiros; o pequeno crop sai pela base
      // desktop 3:4 (mostra ~75% da altura, do topo da cabeça até a cintura) · tablet 5:7 (~79%) · mobile 9:16 (foto inteira)
      frame: { desktop: 3 / 4, tablet: 5 / 7, mobile: 9 / 16 },
    },
  ],
};

/**
 * Festas — decorações reais. Temas só nomeados quando identificáveis com segurança pela imagem;
 * os demais têm título neutro (descritivo) — TEMA_PENDENTE: confirmar nomes com a Heloisa.
 */
export const festas = {
  title: 'As festas',
  intro: 'Cada festa nasce de um tema e de uma família. Algumas das mesas que já montamos.',
  items: [
    { img: 'festas/01-fundo-do-mar', theme: 'Fundo do mar', detail: 'Mesa principal · lembrancinhas', alt: 'Decoração fundo do mar com polvos, sereia, arco rosa e estante de lembrancinhas', pos: '40% 50%' }, // REAL [Siga Mais]
    { img: 'festas/02-safari', theme: 'Safári', detail: 'Painel · bichos de pelúcia', alt: 'Decoração de safári com leão, elefante, onça e arco de balões laranja e verde', pos: '50% 55%' }, // REAL [IG] 640px
    { img: 'festas/03-mesa-posta-rosa', theme: 'Mesa posta em rosa', detail: 'Taças · guardanapos dobrados', alt: 'Mesa redonda com toalha rosa, taças cor-de-rosa e sousplats de bolinhas', pos: '50% 60%' }, // REAL [Siga Mais] — TEMA_PENDENTE
    { img: 'festas/04-frozen', theme: 'Frozen', detail: 'Painel · arco de balões', alt: 'Decoração com tema Frozen, balões em azul e rosa e número 4 iluminado', pos: '50% 50%' }, // REAL [IG] 640px
    { img: 'festas/05-lilas-e-rosa', theme: 'Lilás e rosa', detail: 'Balões · borboletas', alt: 'Mesa decorada com balões lilás e rosa, borboletas e número 3 iluminado', pos: '50% 50%' }, // REAL [IG] 640px — TEMA_PENDENTE
    { img: 'festas/06-mesa-posta-azul', theme: 'Mesa posta em azul', detail: 'Salão · mesas dos convidados', alt: 'Mesa redonda com toalha azul e cadeiras brancas no salão decorado', pos: '50% 55%' }, // REAL [Siga Mais] — TEMA_PENDENTE
    { img: 'festas/07-rosa-e-pink', theme: 'Rosa e pink', detail: 'Arcos de balões · letreiro', alt: 'Decoração em rosa e pink com arcos de balões, estrelas e número 4 iluminado', pos: '50% 50%' }, // REAL [IG] 640px — TEMA_PENDENTE
  ],
  more: 'Mais festas no Instagram',
};

/**
 * Momentos — sequência fotográfica central: as fotos são colocadas uma sobre a outra com o scroll,
 * de DETALHES → FESTA → AMBIENTE; a última camada é a foto do salão (espaco.scenes[0]), que cresce
 * até a tela cheia e vira O Espaço. Recortes de fotos reais [Siga Mais] e [IG] (ver assets-src/FONTES.md).
 */
export const momentos = {
  title: 'Momentos',
  subtitle: 'O que fica depois que as luzes apagam.',
  items: [
    { img: 'momentos/02-tacas', alt: 'Taças cor-de-rosa sobre a mesa posta' },
    { img: 'momentos/01-lembrancinhas', alt: 'Estante com sacolinhas de lembrancinha cor-de-rosa' },
    { img: 'momentos/03-bolo-fundo-do-mar', alt: 'Bolo de andares e painel em arco da decoração fundo do mar' },
    { img: 'momentos/05-carrinho-de-doces', alt: 'Carrinho de doces com cupcake e rosquinha gigantes' },
    { img: 'momentos/04-carrossel-cupcakes', alt: 'Carrossel de cupcakes gigantes com pirulitos na área de recreação' },
  ],
};

/** O Espaço — características CONFIRMADAS (matéria Siga Mais, mar/2025). Fotos REAIS do Espaço. */
export const espaco = {
  title: 'O Espaço',
  lead: 'Um lugar inteiro pensado para a festa acontecer — e para a família aproveitar.',
  scenes: [
    {
      img: 'espaco/01-salao', // REAL [Maps] — 3024×4032
      alt: 'Salão do Espaço Heloisa Gavazzi: área de recreação com brinquedão, piso emborrachado colorido e mesinhas, com o salão de festas ao fundo',
      pos: '50% 58%',
      title: 'Salão climatizado',
      items: ['Cozinha', 'Banheiros acessíveis', 'Fraldário'],
    },
    {
      img: 'espaco/02-recreacao', // REAL [Siga Mais]
      alt: 'Área de recreação com carrossel de cupcakes, mesinhas coloridas, fliperamas e brinquedão',
      pos: '64% 50%',
      title: 'Área de recreação',
      items: ['Estações de lazer', 'Monitores acompanhando as crianças'],
    },
    {
      img: 'espaco/03-mesas', // REAL [Siga Mais]
      alt: 'Mesas postas com toalhas em azul e verde-água e cadeiras brancas no salão decorado',
      pos: '62% 40%',
      title: 'Pronto para receber',
      items: ['Mesas e cadeiras', 'Decoração inclusa no pacote'],
    },
  ],
};

export const servicos = {
  title: 'Como podemos fazer a sua festa',
  items: [
    { n: '01', name: 'Decoração', text: 'Temas personalizados, montados à mão — do painel aos docinhos.', img: 'servicos/01-decoracao', alt: 'Decoração fundo do mar montada pela Heloisa', pos: '52% 45%' }, // REAL
    { n: '02', name: 'Espaço de festas', text: 'Salão climatizado com estrutura completa para a festa acontecer sem preocupação.', img: 'servicos/02-espaco', alt: 'Salão do Espaço Heloisa Gavazzi', pos: '50% 60%' }, // REAL
    { n: '03', name: 'Buffet', text: 'Buffet de festas para receber a família e os convidados.', img: 'servicos/03-buffet', alt: 'Mesa posta para os convidados com taças e guardanapos rosa', pos: '40% 70%' }, // REAL (mesa posta) — pedir foto do buffet/comida
    { n: '04', name: 'Recreação com monitores', text: 'Estações de recreação com monitores acompanhando as crianças.', img: 'servicos/04-recreacao', alt: 'Fliperamas, air hockey e brinquedão da área de recreação', pos: '72% 45%' }, // REAL
    { n: '05', name: 'Eventos externos', text: 'Decoração para festas em Adamantina e região.', img: 'servicos/05-eventos-externos', alt: 'Arco de balões colorido na entrada de uma casa', pos: '50% 50%' }, // PLACEHOLDER (Unsplash) — pedir foto de evento externo
  ],
};

/**
 * DEPOIMENTOS — vazio de propósito. NÃO inventar.
 * Preencher com depoimentos reais (destaque "Feedback" do Instagram), com autorização.
 * Enquanto vazio, a seção exibe a palavra da própria Heloisa (citação real, matéria Siga Mais).
 *
 * Formato:
 *   { quote: 'Texto do depoimento', author: 'Nome da mãe/pai', context: 'Festa de 5 anos · Tema X', img: 'depoimentos/<arquivo>' }
 */
export type Depoimento = { quote: string; author: string; context?: string; img?: string };
export const depoimentos: Depoimento[] = [];

export const palavraDaHeloisa = {
  label: 'Nas palavras da Heloisa',
  // Citação literal publicada no portal Siga Mais (27/03/2025).
  quote: 'Quando abri aqui, meu propósito com Deus era esse, de festa para todos, que todos pudessem ter a condição de fazer uma festa infantil.',
  author: 'Heloisa Gavazzi',
  img: 'depoimentos/fundo', // REAL [Siga Mais] — "Quando abri aqui": a fachada do Espaço
  alt: 'Fachada do Espaço Heloisa Gavazzi decorada com arco de balões em tons pastel',
  feedbackCta: 'Ver feedbacks das famílias no Instagram',
};

export const cta = {
  lines: ['Vamos montar', 'a festa do', 'seu filho?'],
  button: 'Planejar minha festa',
  note: 'Atendimento pelo WhatsApp',
};

export const footer = {
  img: 'footer/baloes', // REAL [Siga Mais] — recorte dos balões da decoração fundo do mar
  alt: 'Balões em tons pastel de uma decoração da Heloisa',
  signature: 'Feito com cuidado, detalhe por detalhe.',
};
