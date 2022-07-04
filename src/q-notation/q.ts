/* eslint-disable */

// fp-ts's "pipe" from https://github.com/gcanti/fp-ts/blob/master/src/function.ts
// the parameters have reverted order

export function q<A>(a: A): A;
export function q<A, B>(ab: (a: A) => B, a: A): B;
export function q<A, B, C>(bc: (b: B) => C, ab: (a: A) => B, a: A): C;
export function q<A, B, C, D>(
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): D;
export function q<A, B, C, D, E>(
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): E;
export function q<A, B, C, D, E, F>(
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): F;
export function q<A, B, C, D, E, F, G>(
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): G;
export function q<A, B, C, D, E, F, G, H>(
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): H;
export function q<A, B, C, D, E, F, G, H, I>(
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): I;
export function q<A, B, C, D, E, F, G, H, I, J>(
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): J;
export function q<A, B, C, D, E, F, G, H, I, J, K>(
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): K;
export function q<A, B, C, D, E, F, G, H, I, J, K, L>(
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): L;
export function q<A, B, C, D, E, F, G, H, I, J, K, L, M>(
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): M;
export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): N;
export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): O;

export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
    op: (o: O) => P,
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): P;

export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
    pq: (p: P) => Q,
    op: (o: O) => P,
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): Q;

export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
    qr: (q: Q) => R,
    pq: (p: P) => Q,
    op: (o: O) => P,
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): R;

export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
    rs: (r: R) => S,
    qr: (q: Q) => R,
    pq: (p: P) => Q,
    op: (o: O) => P,
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): S;

export function q<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
    st: (s: S) => T,
    rs: (r: R) => S,
    qr: (q: Q) => R,
    pq: (p: P) => Q,
    op: (o: O) => P,
    no: (n: N) => O,
    mn: (m: M) => N,
    lm: (l: L) => M,
    kl: (k: K) => L,
    jk: (j: J) => K,
    ij: (i: I) => J,
    hi: (h: H) => I,
    gh: (g: G) => H,
    fg: (f: F) => G,
    ef: (e: E) => F,
    de: (d: D) => E,
    cd: (c: C) => D,
    bc: (b: B) => C,
    ab: (a: A) => B,
    a: A
): T;
export function q(
    a: unknown,
    ab?: Function,
    bc?: Function,
    cd?: Function,
    de?: Function,
    ef?: Function,
    fg?: Function,
    gh?: Function,
    hi?: Function
): unknown {
    switch (arguments.length) {
        case 1:
            return a;
        case 2:
            return ab!(a);
        case 3:
            return bc!(ab!(a));
        case 4:
            return cd!(bc!(ab!(a)));
        case 5:
            return de!(cd!(bc!(ab!(a))));
        case 6:
            return ef!(de!(cd!(bc!(ab!(a)))));
        case 7:
            return fg!(ef!(de!(cd!(bc!(ab!(a))))));
        case 8:
            return gh!(fg!(ef!(de!(cd!(bc!(ab!(a)))))));
        case 9:
            return hi!(gh!(fg!(ef!(de!(cd!(bc!(ab!(a))))))));
        default:
            let ret = arguments[0];
            for (let i = 1; i < arguments.length; i++) {
                ret = arguments[i](ret);
            }
            return ret;
    }
}
