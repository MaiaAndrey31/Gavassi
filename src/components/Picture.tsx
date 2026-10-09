import type { CSSProperties } from 'react';
import { fallbackSrc, getImage, srcSet } from '../lib/images';

/**
 * Enquadramento (object-position). Uma string vale para todos os tamanhos;
 * um objeto define direção de arte por breakpoint (cascata: base → md → lg → xl).
 *   base: < 768 · md: ≥ 768 · lg: ≥ 1024 · xl: ≥ 1600
 */
export type Framing = string | { base?: string; md?: string; lg?: string; xl?: string };

type Props = {
  id: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  position?: Framing;
  style?: CSSProperties;
};

function framingVars(position?: Framing): Record<string, string> {
  if (!position) return {};
  if (typeof position === 'string') return { '--op': position };
  const vars: Record<string, string> = {};
  if (position.base) vars['--op'] = position.base;
  if (position.md) vars['--op-md'] = position.md;
  if (position.lg) vars['--op-lg'] = position.lg;
  if (position.xl) vars['--op-xl'] = position.xl;
  return vars;
}

/**
 * Imagem responsiva AVIF/WebP com cor dominante + LQIP como fundo enquanto carrega.
 * Lazy por padrão; `priority` apenas para a Hero (LCP).
 */
export function Picture({ id, alt, sizes, className, priority, position, style }: Props) {
  const meta = getImage(id);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(id, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(id, 'webp')} sizes={sizes} />
      <img
        src={fallbackSrc(id)}
        alt={alt}
        width={meta.w}
        height={meta.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        style={{
          backgroundColor: meta.color,
          backgroundImage: `url(${meta.lqip})`,
          backgroundSize: 'contain',
          ...(framingVars(position) as CSSProperties),
          ...style,
        }}
      />
    </picture>
  );
}
