export type Effect = () => void

class EffectStack {
  #stack: Effect[] = []
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
}

const stack = new EffectStack()

export function effect(f: Effect) {
  stack.effect(f)
}

export class ValueStore {
  #store: Set<Effect> = new Set
  collect() {
    if (stack.has()) {
      this.#store.add(stack.last())
    }
  }
  effect() {
    for (const f of this.#store) {
      f()
    }
  }
}

export class MapStore<K = PropertyKey> {
  #store: Map<K, ValueStore> = new Map
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
  }

  delete(key: K) {
    this.effect(key)
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
}