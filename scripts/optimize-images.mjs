/**
 * Otimização de imagens — Heloisa Gavazzi
 *
 * Fonte:  assets-src/<seção>/<nome>.(jpg|jpeg|png|webp)
 * Saída:  public/img/<seção>/<nome>-<largura>.(avif|webp)
 *         src/content/images.generated.json  (dimensões, larguras, cor dominante, LQIP)
 *
 * Para trocar uma foto provisória por uma real:
 *   1. substitua o arquivo em assets-src mantendo o MESMO nome (ou crie um novo e
 *      atualize a chave em src/content/site.ts);
 *   2. rode `npm run images`.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets-src');
const OUT = path.join(root, 'public', 'img');
const MANIFEST = path.join(root, 'src', 'content', 'images.generated.json');
/**
 * Perfis por grupo, conforme o tamanho REAL em que a foto aparece:
 *  - large: Hero, Festas, Espaço, Trajetória, Depoimento (até tela cheia) → degraus até 2560
 *  - small: Momentos, Manifesto, Serviços, Footer (≤ ~30vw na tela)      → até 1024
 * Nunca amplia: larguras acima do original são descartadas (o original entra como último degrau).
 */
const PROFILES = {
  large: { widths: [480, 768, 1024, 1280, 1600, 1920, 2560], avif: 60, webp: 82, chroma: '4:4:4' },
  small: { widths: [320, 480, 768, 1024], avif: 58, webp: 80, chroma: '4:2:0' },
};
const GROUP = { hero: 'large', festas: 'large', espaco: 'large', trajetoria: 'large', depoimentos: 'large' };
const EXT = /\.(jpe?g|png|webp)$/i;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat().filter((f) => EXT.test(f));
}

async function isFresh(src, out) {
  try {
    const [a, b] = await Promise.all([fs.stat(src), fs.stat(out)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

const files = await walk(SRC);
const manifest = {};

for (const file of files) {
  const key = path.relative(SRC, file).replace(/\\/g, '/').replace(EXT, '');
  const base = sharp(file).rotate();
  const meta = await base.metadata();
  const width = meta.width;
  const height = meta.height;
  const profile = PROFILES[GROUP[key.split('/')[0]] ?? 'small'];
  const widths = profile.widths.filter((w) => w < width);
  if (width <= 2560 && (widths.at(-1) ?? 0) < width) widths.push(width);
  const uniq = [...new Set(widths)];
  // fotos já pequenas (ex.: 640px do Instagram) não recebem nitidez extra e ganham mais qualidade
  const lowres = width <= 800;

  await fs.mkdir(path.join(OUT, path.dirname(key)), { recursive: true });
  for (const w of uniq) {
    for (const fmt of ['avif', 'webp']) {
      const out = path.join(OUT, `${key}-${w}.${fmt}`);
      if (await isFresh(file, out)) continue;
      let img = sharp(file).rotate().resize({ width: w, withoutEnlargement: true, kernel: 'lanczos3' });
      // nitidez leve apenas quando há redução real (compensa a suavização do resize)
      if (!lowres && w <= width * 0.8) img = img.sharpen({ sigma: 0.45, m1: 0.6, m2: 1.2 });
      if (fmt === 'avif') await img.avif({ quality: lowres ? profile.avif + 6 : profile.avif, effort: 5, chromaSubsampling: profile.chroma }).toFile(out);
      else await img.webp({ quality: lowres ? profile.webp + 4 : profile.webp, effort: 5, smartSubsample: true }).toFile(out);
    }
  }

  const { dominant } = await sharp(file).rotate().resize(64).stats();
  const lqipBuf = await sharp(file).rotate().resize(20).blur(1.2).webp({ quality: 40 }).toBuffer();

  manifest[key] = {
    w: width,
    h: height,
    widths: uniq,
    color: toHex(dominant),
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
  };
  console.log('✓', key, uniq.join(','));
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

// Imagem de compartilhamento (Open Graph) a partir da Hero
const hero = files.find((f) => f.includes(`${path.sep}hero${path.sep}`));
if (hero) {
  await sharp(hero)
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(root, 'public', 'og.jpg'));
}
console.log(`\n${files.length} imagens → ${path.relative(root, MANIFEST)}`);
