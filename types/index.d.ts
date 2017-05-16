declare class Speedball<Map> {
    /* PROPOSAL 2 */
    func<R extends keyof Map, A extends keyof Map>(f: (a: Map[A]) => Map[R], deps: [A]): Factory<Map[R]>;


    resolve<K extends keyof Map>(name: K): Map[K];
    register<K extends keyof Map>(name: K, factory: Factory<Map[K]>): this;
}

// "a: never" means a Factory can never be called.
export type Factory<T> = (a: never) => T;

export function value<T>(x: T): Factory<T>;
export function singleton<T>(factory: Factory<T>): Factory<T>;
export function func<Map, R extends keyof Map>(f: () => Map[R]): Factory<Map[R]>;
export function func<Map, A extends keyof Map, R extends keyof Map>(f: (a: Map[A]) => Map[R], deps: [A]): Factory<Map[R]>;
export function construct();
export function props();

export default Speedball

/* PROPOSAL 1 */

export function register<Map, K extends keyof Map>(container: Speedball<Map>, name: K, factory: Factory<Map[K]>);