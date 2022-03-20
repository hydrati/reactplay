import { ValueStore, effect } from './deps'

export interface Computed<T> {
  readonly value: T
}

export type ComputedFn<T> = () => T

let activeComputed = new WeakMap<any, ValueStore>()

export function isComputed<T>(o: T) {
  return activeComputed.has(o)
}

class ComputedImpl<T> implements Computed<T> {
  #fn: ComputedFn<T>
  #val!: T
  #store: ValueStore = new ValueStore
  constructor(fn: ComputedFn<T>) {
    this.#fn = fn
    activeComputed.set(this, this.#store)
    this.#effect()
  }

  #effect() {
    effect(() => {
      this.#val = this.#fn()
      this.#store.effect()
    })
  }

  get value() {
    this.#store.collect()
    return this.#val
  }
}

export function computed<T>(o: () => T): Computed<T> {
  return new ComputedImpl(o)
}

export function getComputedStore<T extends object>(o: T) {
  return activeComputed.get(o)
}