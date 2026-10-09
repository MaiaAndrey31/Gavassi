import manifest from '../content/images.generated.json';

export type ImageMeta = { w: number; h: number; widths: number[]; color: string; lqip: string };
const images = manifest as Record<string, ImageMeta>;

export function getImage(key: string): ImageMeta {
  const meta = images[key];
  if (!meta) throw new Error(`Imagem não encontrada no manifesto: "${key}". Rode \`npm run images\`.`);
  return meta;
}

export const srcSet = (key: string, fmt: 'avif' | 'webp') =>
  getImage(key)
    .widths.map((w) => `/img/${key}-${w}.${fmt} ${w}w`)
    .join(', ');

export const fallbackSrc = (key: string, target = 1280) => {
  const { widths } = getImage(key);
  const w = widths.find((x) => x >= target) ?? widths[widths.length - 1];
  return `/img/${key}-${w}.webp`;
};
