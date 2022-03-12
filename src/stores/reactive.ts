import { MapStore } from "./deps"
import { RefImpl, RefStore, ShallowRefStore } from "./ref"

let activeReactive = new WeakMap<any, MapStore>()
let activeReactiveTarget = new WeakMap<any, any>()

let activeTargetReactive = new WeakMap<any, any>()
let activeTargetShallowReactive = new WeakMap<any, any>()


export function isReactive<T extends object>(o: T): boolean {
  return activeReactive.has(o)
}

function createReactive<T extends object>(o: T, shallow = false): T {
  if (isReactive(o)) {
    return o
  }

  if (shallow) {
    const proxy = activeTargetShallowReactive.get(o)
    if (proxy !== undefined) return proxy
  } else {
    const proxy = activeTargetReactive.get(o)
    if (proxy !== undefined) return proxy
  }

  const store = new MapStore()
  const proxy = new Proxy(o, {
    get(target, p, r) {
      store.collect(p)
      return Reflect.get(target, p, r)
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
  })

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