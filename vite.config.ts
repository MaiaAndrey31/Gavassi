import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const HERO = 'hero/fundo-do-mar';

/**
 * Preload responsivo da foto da Hero (LCP) + URLs do domínio.
 * Enquanto o domínio NÃO estiver confirmado (VITE_SITE_CONFIRMED != 'true'), o build omite
 * canonical, og:url, URLs absolutas no JSON-LD e o sitemap — nada de SEO apontando para domínio provisório.
 */
function site(siteUrl: string, confirmed: boolean): Plugin {
  return {
    name: 'hg-site',
    transformIndexHtml(html) {
      const manifest = JSON.parse(readFileSync('src/content/images.generated.json', 'utf8'));
      const widths: number[] = manifest[HERO].widths;
      const set = widths.map((w) => `/img/${HERO}-${w}.avif ${w}w`).join(', ');
      const tag = `<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="100vw" fetchpriority="high" />`;
      let out = html.replace('<!--hero-preload-->', tag);
      if (confirmed) return out.replaceAll('%SITE_URL%', siteUrl);
      out = out
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/\s*<meta property="og:url"[^>]*>/, '')
        .replace(/\s*"url": "%SITE_URL%\/",/, '')
        .replaceAll('%SITE_URL%', '');
      return out;
    },
    generateBundle() {
      if (!confirmed) {
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nAllow: /\n' });
        return;
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
` });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`,
      });
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), ...(isSsrBuild ? [] : [site(env.VITE_SITE_URL, env.VITE_SITE_CONFIRMED === 'true')])],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
    },
  };
});
