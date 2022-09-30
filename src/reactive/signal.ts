import { notify, track } from './effect'
import { getReactiveRaw } from './reactive'
import { hasChanged, setSymbolTag, setToStringTag } from './utils'

const kSignal = Symbol('kSignal')

export interface Signal<T> {
  value: T
}

export function isSignal(sig: any): boolean {
  return typeof sig === 'object' && sig[kSignal] === true
}

export function useSignal<T>(initalValue: T): Signal<T> {
  return createSignal(initalValue)
}

export function createSignal<T>(initalValue: T): Signal<T> {
  let value = initalValue

  const sig: Signal<T> = {
    get value() {
      track(sig, 'value')
      return value
    },
    set value(newValue: T) {
      if (hasChanged(value, newValue)) {
        value = newValue
        notify(sig, 'value')
      }
    },
  }

  setSymbolTag(sig, kSignal)
  setToStringTag(sig, 'Signal')

  return sig
}

export function toRef<T extends object, K extends keyof T>(
  obj: T,
  key: K
): Signal<T[K]> {
  const sig: Signal<T[K]> = {
    get value() {
      return obj[key]
    },
    set value(newValue: T[K]) {
      obj[key] = newValue
    },
  }

  setSymbolTag(sig, kSignal)
  setToStringTag(sig, 'Ref')

  return sig
}

export type Refs<T extends object> = {
  [K in keyof T]: Signal<T[K]>
}

export function useRefs<T extends object>(refs: Refs<T>): T {
  return new Proxy(refs, {
    get(target, key, recv) {
      const value = Reflect.get(target, key, recv)
      return isSignal(value) ? value.value : value
    },
    set(target, key, newValue, recv) {
      const value = Reflect.get(target, key, recv)
      if (isSignal(value)) {
        return Reflect.set(value, 'value', newValue, value)
      } else {
        return Reflect.set(target, key, newValue, recv)
      }
    },
  }) as T
}

export function toRefs<T extends object>(obj: T): Refs<T> {
  const raw = getReactiveRaw(obj)
  if (Array.isArray(raw)) {
    const o = []
    for (const i of raw.keys()) {
      o[i] = toRef(obj, i as any)
    }
    return o as any
  } else if (Object.getPrototypeOf(obj) === Object.prototype) {
    const o = {} as any
    for (const key in raw) {
      o[key] = toRef(obj, key)
    }
    return o
  } else {
    console.warn(
      'warn: create reactive objects from objects with unknown prototype'
    )
    const o = {} as any
    for (const key in obj) {
      o[key] = toRef(obj, key)
    }
    return o
  }
}
