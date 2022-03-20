import { ValueStore } from './deps'

export interface Ref<T> {
  value: T
}

export type ShallowRefStore<T> = {
  [K in keyof T]: Ref<T[K]>
}

export type RefStore<T> = {
  [K in keyof T]: T[K] extends object ? RefStore<T[K]> : Ref<T[K]>
}

let activeRef = new WeakMap<any, ValueStore>()

export class RefImpl<T> implements Ref<T> {
  #store: ValueStore
  #value: T
  constructor(init: T, store: ValueStore = new ValueStore) {
    this.#store = store
    this.#value = init
    activeRef.set(this, this.#store)
  }

  get value() {
    this.#store.collect()
    return this.#value
  }

  set value(n: T) {
    this.#value = n
    this.#store.effect()
  }
}

export function ref<T>(init: T): Ref<T> {
  return new RefImpl<T>(init)
}

export function isRef<T>(o: T): boolean {
  return activeRef.has(o)
}

export function getRefStore<T extends object>(o: T) {
  return activeRef.get(o)
}