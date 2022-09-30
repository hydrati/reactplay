import { Effect } from './effect'

export type Optional<T> = T | undefined

export function setSymbolTag(obj: any, tag: symbol, value: any = true): any {
  return Object.defineProperty(obj, tag, {
    value,
    writable: false,
    configurable: false,
    enumerable: false,
  })
}

export function setToStringTag(obj: any, tag: string): any {
  return setSymbolTag(obj, Symbol.toStringTag, tag)
}

export function hasChanged(a: any, b: any): boolean {
  // eslint-disable-next-line no-self-compare
  return a !== b && (a === a || b === b)
}

export function queueMicrotask(fn: () => void): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Promise.resolve().then(fn)
}

export function isPlainObject(obj: object): boolean {
  return (
    typeof obj === 'object' &&
    (Object.getPrototypeOf(obj) === Object.prototype ||
      Object.getPrototypeOf(obj) === null)
  )
}

export function syncEffectExecute<T>(eff: Effect<T>): T {
  return eff.effect()
}

export interface Value<T> {
  readonly value: T
}

export function useValue<T>(val: Value<T>): T {
  return val.value
}

export interface ValueMut<T> {
  value: T
}

export function setValue<T>(v: ValueMut<T>, fn: (value: T) => T): T {
  const newVal = fn(v.value)
  v.value = newVal
  return newVal
}

export function traverse<T>(value: T, history: Set<any> = new Set()): T {
  if (typeof value !== 'object' || value == null || history.has(value)) {
    return value
  }

  history.add(value)

  if (Array.isArray(value)) {
    for (const elem of value) {
      traverse(elem, history)
    }
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], history)
    }
  } else {
    console.warn('warn: traverse unknown objects')
    for (const key in value) {
      traverse(value[key], history)
    }
  }

  return value
}
