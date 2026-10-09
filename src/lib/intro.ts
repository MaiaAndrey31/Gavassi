/** Sinal único "preloader terminou → começa a intro da Hero". */
let done = false;
const subs = new Set<() => void>();

export function onIntro(cb: () => void) {
  if (done) {
    cb();
    return () => {};
  }
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function startIntro() {
  if (done) return;
  done = true;
  subs.forEach((cb) => cb());
  subs.clear();
}
