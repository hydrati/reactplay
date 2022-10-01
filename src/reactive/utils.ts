import { Effect } from './effect'

const kStop = Symbol('kStop')

export function useStop<T>(x: T): () => void {
  if (typeof x !== 'object' || typeof (x as any)[kStop] !== 'function') {
    if (typeof x === 'function') {
      return () => {
        x()
      }
    }

    return () => {}
  }

  const stop = (x as any)[kStop]

  return () => {
    stop()
  }
}

export function setStopFn(obj: any, stop: () => void): void {
  setSymbolTag(obj, kStop, stop)
}

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

export type Accessor<T> = [
  getter: () => T,
  setter: (fn: (value: T) => T) => void,
  target: ValueMut<T>
]

export function useValue<T>(val: ValueMut<T>): Accessor<T> {
  return [
    () => getValue(val),
    (f) => {
      setValue<T>(val, f)
    },
    val,
  ]
}

export function useGetter<T>(
  val: Value<T>
): [getter: () => T, target: Value<T>] {
  return [() => getValue(val), val]
}

export function useSetter<T>(
  val: ValueMut<T>
): [setter: (fn: (value: T) => T) => void, target: ValueMut<T>] {
  return [
    (f) => {
      setValue<T>(val, f)
    },
    val,
  ]
}

export function getValue<T>(val: Value<T>): T {
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
