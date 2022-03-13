import { effect, MapStore } from "./deps"
import { RefImpl, RefStore, ShallowRefStore } from "./ref"

let activeReactive = new WeakMap<any, MapStore>()
let activeReadonly = new WeakMap<any, MapStore>()
let activeReactiveTarget = new WeakMap<any, any>()

let activeTargetReactive = new WeakMap<any, any>()
let activeTargetShallowReactive = new WeakMap<any, any>()
let activeTargetReadonly = new WeakMap<any, any>()
let activeTargetShallowReadonly = new WeakMap<any, any>()

const ReactiveStore = Symbol("Reactive")

export function isReactive<T extends object>(o: T): boolean {
  return activeReactive.has(o)
}

export function isReadonly<T extends object>(o: T): boolean {
  return activeReadonly.has(o)
}

function createReadonly<T extends object>(o: T, shallow = false, parent?: MapStore): T {
  if (isReadonly(o) || typeof o !== 'object') {
    return o
  }

  if (shallow) {
    const proxy = activeTargetShallowReadonly.get(o)
    if (proxy !== undefined) return proxy
  } else {
    const proxy = activeTargetReadonly.get(o)
    if (proxy !== undefined) return proxy
  }

  const store = new MapStore(parent)
  const proxy = new Proxy(o, {
    get(target, p, r) {
      let value: any
      if (!store.has(p)) {
        effect(() => {
          value = Reflect.get(target, p, r)
          store.effect(p)
        })
      } else {
        value = Reflect.get(target, p, r)
      }
      store.collect(p)
      return shallow ? value : createReadonly(value, false, store)
    },
    set() {
      return false
    },
    deleteProperty() {
      return false
    }
  } as ProxyHandler<T>)

  activeReadonly.set(proxy, store)
  activeReactiveTarget.set(proxy, o)
  
  if (shallow) {
    activeTargetShallowReadonly.set(o, proxy)
  } else {
    activeTargetReadonly.set(o, proxy)
  }

  return proxy
}

function createReactive<T extends object>(o: T, shallow = false, parent: MapStore | null = null): T {
  if (isReactive(o) || typeof o !== 'object') {
    return o
  }

  if (shallow) {
    const proxy = activeTargetShallowReactive.get(o)
    if (proxy !== undefined) return proxy
  } else {
    const proxy = activeTargetReactive.get(o)
    if (proxy !== undefined) return proxy
  }

  const store = new MapStore(parent)
  const proxy = new Proxy(o, {
    get(target, p, r) {
      store.collect(p)
      const value = Reflect.get(target, p, r)
      return shallow ? value : createReactive(value, false, store)
    },
    set(target, p, v, r) {
      if (typeof v === "object" && !isReactive(v) && !shallow) {
        v = createReactive(v)
        const ret = Reflect.set(target, p, v, r)
        store.effect(p)
        return ret
      } else {
        const ret = Reflect.set(target, p, v, r)
        store.effect(p)
        return ret
      }
    },
    deleteProperty(target, p) {
      const ret = Reflect.deleteProperty(target, p)
      store.delete(p)

      return ret
    }
  } as ProxyHandler<T>)

  activeReactive.set(proxy, store)
  activeReactiveTarget.set(proxy, o)
  
  if (shallow) {
    activeTargetShallowReactive.set(o, proxy)
  } else {
    activeTargetReactive.set(o, proxy)
  }

  return proxy
}

export function reactive<T extends object = {}>(o: T): T {
  return createReactive(o)
}

export function shallowReactive<T extends object = {}>(o: T): T {
  return createReactive(o, true)
}

export function getReactiveStore<T extends object>(o: T) {
  return activeReactive.get(o)
}

export function getReactiveTarget<T extends object>(o: T) {
  return activeReactiveTarget.get(o)
}

export function readonly<T extends object = {}>(o: T): Readonly<T> {
  return createReadonly(o)
}

export function shallowReadonly<T extends object = {}>(o: T): Readonly<T> {
  return createReadonly(o, true)
}

export function getReadonlyStore<T extends object>(o: T) {
  return activeReadonly.get(o)
}

export function getReadonlyTarget<T extends object>(o: T) {
  return activeReactiveTarget.get(o)
}

function recToRefs(target: any, store?: MapStore, cir: WeakSet<any> = new WeakSet): any {
  const record: any = {}
  const names = Object.keys(target)
  for(const name of names) {
    if (typeof target[name] === "object") {
      if (cir.has(target[name])) {
        throw new ReferenceError('ToRefs is not allowed circular references.')
      }
      cir.add(target[name])
      record[name] = recToRefs(target[name], getReactiveStore(target[name]), cir)
    } else {
      record[name] = new RefImpl(target[name], store?.store(name))
    }
  }
}

function reactiveToRefs<T extends object>(o: T, shallow = false) {
  if (!isReactive(o)) {
    return o
  }

  const store = getReactiveStore(o)!
  const target = getReactiveTarget(o)!
  

  if (shallow) {
    const names = Object.keys(target)
    const record = {} as any
    for (const name of names) {
      if (typeof target[name] === "object" && !shallow) {
        record[name] = target[name]
      } else {
        record[name] = new RefImpl(target[name], store.store(name))
      }
    }
    return record
  } else return recToRefs(target, store)
}

export function toRefs<T extends object>(o: T): RefStore<T> {
  return reactiveToRefs(o)
}

export function shallowToRefs<T extends object>(o: T): ShallowRefStore<T> {
  return reactiveToRefs(o, true)
}