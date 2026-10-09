import { Fragment } from 'react';

type Props = {
  text: string;
  /** trecho (uma ou mais palavras) a ser destacado em itálico */
  emphasis?: string;
  wordClass?: string;
};

/**
 * Divide o texto em palavras mascaradas (<span class="mask"><span>palavra</span></span>)
 * sem dependências. Os espaços continuam como texto real, então leitores de tela
 * leem a frase normalmente.
 */
export function Words({ text, emphasis, wordClass = 'w' }: Props) {
  const emph = new Set(emphasis ? emphasis.split(' ') : []);
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => {
        const bare = word.replace(/[.,!?…]/g, '');
        const inner = <span className={wordClass}>{word}</span>;
        return (
          <Fragment key={i}>
            <span className="mask">{emph.has(bare) ? <em>{inner}</em> : inner}</span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </>
  );
}
