import { kSignal, kSignalRaw } from './constants'
import { notify, track } from './effect'
import { getReactiveRaw } from './reactive'
import {
  hasChanged,
  isPlainObject,
  setSymbolTag,
  setToStringTag,
} from './utils'

export interface Signal<T> {
  value: T
}

export function isSignal(sig: any): boolean {
  return sig[kSignal] === true
}

export function getSignalRaw<T>(sig: Signal<T>): T {
  if (!isSignal(sig)) {
    throw new TypeError('is not a signal')
  }

  return (sig as any)[kSignalRaw]
}

export interface SignalOptions<T> {
  equals: false | ((oldValue: T, newValue: T) => boolean)
}

export function useSignal<T>(
  initalValue: Signal<T>,
  options?: SignalOptions<T>
): Signal<T>
export function useSignal<T>(
  initalValue: T,
  options?: SignalOptions<T>
): Signal<T>
export function useSignal<T>(
  initalValue: T | Signal<T>,
  options?: SignalOptions<T>
): Signal<T> {
  return createSignal(
    isSignal(initalValue)
      ? getSignalRaw(initalValue as any)
      : (initalValue as any),
    options
  )
}

export function createSignal<T>(
  initalValue: T,
  options?: SignalOptions<T>
): Signal<T> {
  let value = initalValue

  const equals =
    typeof options?.equals === 'function' ? options.equals : hasChanged

  const sig = {
    get value() {
      track(sig, 'value')
      return value
    },
    get [kSignalRaw]() {
      return value
    },
    set value(newValue: T) {
      if (options?.equals === false || equals(value, newValue)) {
        value = newValue
        notify(sig, 'value')
      }
    },
  }

  setSymbolTag(sig, kSignal)
  setToStringTag(sig, 'Signal')

  return sig
}

export function createRef<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  readonly: boolean = false
): Signal<T[K]> {
  const sig = {
    get value() {
      return obj[key]
    },
    get [kSignalRaw]() {
      return obj[key]
    },
    set value(newValue: T[K]) {
      if (!readonly) {
        obj[key] = newValue
      }
    },
  }

  setSymbolTag(sig, kSignal)
  setToStringTag(sig, 'Ref')

  return sig
}

export function useReadonlyRef<T extends object, K extends keyof T>(
  obj: T,
  key: K
): Signal<T[K]> {
  return createRef(obj, key, true)
}

export function useRef<T extends object, K extends keyof T>(
  obj: T,
  key: K
): Signal<T[K]> {
  return createRef(obj, key)
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
      o[i] = useRef(obj, i as any)
    }
    return o as any
  } else if (isPlainObject(obj)) {
    const o = {} as any
    for (const key in raw) {
      o[key] = useRef(obj, key)
    }
    return o
  } else {
    console.warn(
      'warn: create reactive objects from objects with unknown prototype'
    )
    const o = {} as any
    for (const key in obj as any) {
      o[key] = useRef(obj, key)
    }
    return o
  }
}
