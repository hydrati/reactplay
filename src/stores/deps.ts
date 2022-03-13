
import { Lazy } from '../jsx'
import { computed, Computed, ComputedFn, isComputed } from './computed'
import { getReactiveStore, isReactive, isReadonly } from './reactive'
import { Ref, isRef, ref as makeRef } from './ref'

export type Effect = () => void
export type Watcher<T> = (oldValue: Dereactive<T>, newValue: Dereactive<T>, onStop: (f: Effect) => void) => void
export type WatchEffectFn = (onInvalidate: (f: Effect) => void) => void
export type Reactive<T> = Ref<T> | Computed<T> | Lazy<T> | T
export type Dereactive<T> = (
  T extends Ref<infer P> ? P :
  T extends Computed<infer P> ? P :
  T extends Lazy<infer P> ? P : 
  T extends unknown[] ? DereactiveMap<T> : T
)

export type DereactiveMap<T> = {
  [K in keyof T]: Dereactive<T[K]>
}

class EffectStack {
  #stack: Effect[] = []
  #mark: WeakMap<Effect, Set<ValueStore>> = new WeakMap
  constructor() {}
  last() {
    return this.#stack[this.#stack.length - 1]
  }

  has() {
    return this.#stack.length > 0
  }
  
  effect(f: Effect) {
    this.#stack.push(f)
    f()
    this.#stack.pop()
  }

  watchEffect(f: WatchEffectFn): Effect {
    let onInvalidate: Effect | null = null
    const effect = () => {
      onInvalidate?.()
      f(f => onInvalidate = f)
    }

    this.effect(effect)

    return () => {
      onInvalidate?.()
      this.clear(effect)
    }
  }

  watch<T extends ([Reactive<unknown>] | Reactive<unknown>[])>(f: T, effect: Watcher<T>, deep = true): Effect {
    const watchable = (f as any[]).map(ref => {
      if (isRef(ref) || isComputed(ref)) {
        return ref
      } else if (typeof ref === 'function') {
        return computed(ref)
      } else if (isReactive(ref) || isReadonly(ref)) {
        const store = getReactiveStore(ref) ?? getReactiveStore(ref)!
        let collected = false
        if (deep) {
          return computed(() => {
            if (!collected) {
              store.collectDeep()
              collected = true
            }
            return ref
          })
        }
      }
      return computed(() => ref)
    }) as Computed<unknown>[]

    let old: any = null
    return this.watchEffect(o => {
      const newVal: any = watchable.map(v => v.value)
      if (old != null) {
        effect(old, newVal, o)
      }

      old = newVal
    })
  }

  mark(f: Effect, s: ValueStore) {
    const store = this.#mark.get(f)
    if (store === undefined) {
      const set = new Set<ValueStore>()
      set.add(s)
      this.#mark.set(f, set)
    } else {
      store.add(s)
    }
  }

  clear(f: Effect) {
    const store = this.#mark.get(f)
    if (store !== undefined) {
      for (const s of store) {
        s.remove(f)
      }
      this.#mark.delete(f)
    }
  }
}

const stack = new EffectStack()
export { stack as effectStack }

export const watch = stack.watch.bind(stack)
export const watchEffect = stack.watchEffect.bind(stack)

export function effect(f: Effect) {
  stack.effect(f)
}

export class ValueStore {
  #store: Set<Effect> = new Set
  collect() {
    if (stack.has()) {
      const last = stack.last()
      stack.mark(last, this)
      this.#store.add(last)
    }
  }
  effect() {
    for (const f of this.#store) {
      f()
    }
  }
  remove(v: Effect) {
    this.#store.delete(v)
  }
}

export class MapStore<K = PropertyKey> {
  #store: Map<K, ValueStore> = new Map
  #deep: ValueStore = new ValueStore
  #parent: MapStore | null

  constructor(parent: MapStore | null = null) {
    this.#parent = parent ?? null
  }

  collect(key: K) {
    if (this.#store.has(key)) {
      this.#store.get(key)?.collect()
    } else {
      if (stack.has()) {
        const store = new ValueStore()
        store.collect()
        this.#store.set(key, store)
      }
    }
  }

  effect(key: K) {
    this.#store.get(key)?.effect()
    this.effectDeep()
  }

  effectDeep() {
    this.#deep.effect()
    this.#parent?.effectDeep()
  }

  delete(key: K) {
    this.#store.delete(key)
  }

  has(key: K) {
    return this.#store.has(key)
  }

  set(key: K, store: ValueStore) {
    this.#store.set(key, store)
  }

  store(key: K) {
    return this.#store.get(key)
  }

  collectDeep() {
    this.#deep.collect()
  }
}