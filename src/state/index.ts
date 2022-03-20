import { computed, reactive } from "../store"

type Computed<T> = Readonly<{
  [K in keyof T]: T[K] extends (...args: any[]) => infer P ? P : never
}>

export type Getters<T> = Record<PropertyKey, (state: Readonly<T>) => unknown>
export type Actions = Record<PropertyKey, (...args: any[]) => unknown>
export interface StoreInit<T extends object, C, A> {
  name?: string
  state: () => T
  getters?: ThisType<Computed<C>> & C
  actions?: ThisType<Computed<C> & T & A> & A
}

function createStoreGetter<T extends object, G extends Getters<T>>(state: T, getters: G): Computed<G> {
  const s = new WeakMap<any, any>()
  const p = new Proxy(getters, {
    get(_, p, r) {
      // console.log(p, state, getters)
      const f = s.get(getters[p])
      if (f !== undefined) return f.value
      else {
        const f = computed(() => {
          return getters[p].call(p, state)
        })
        s.set(getters[p], f)
        return f.value
      }
    }
  }) as Computed<G>

  return p
}

type State<T, G, A> = {
  state: T
  getters: Computed<G>
} & Computed<G> & A & T

function createState<T extends object, G extends object, A extends Actions>(s: T, g: Computed<G>, a: A): State<T, G, A> {
  return new Proxy({}, {
    get(_, p) {
      // console.log(p, s, g, a)
      if (p === 'state') {
        return s
      } else if (p === 'getters') {
        return g
      } else if (Reflect.has(a, p)) {
        return (a as any)[p].bind(s)
      } else if (Reflect.has(g, p)) {
        return (g as any)[p]
      } else if (Reflect.has(s, p)) {
        return (s as any)[p]
      }
    },
    set(_, p, v) {
      if (Reflect.has(s, p)) {
        return Reflect.set(s, p, v)
      } else return false
    }
  }) as any
}

export function defineStore<T extends object, C extends Getters<T>, A extends Actions>(init: StoreInit<T, C, A>) {
  const store = reactive(init.state())
  const getters = createStoreGetter<T, C>(store, init.getters ?? {} as any)
  const state = createState<T, C, A>(store, getters, init.actions ?? {} as any)

  return () => state
}