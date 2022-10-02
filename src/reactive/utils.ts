import { Effect } from './effect'

const kStop = Symbol('kStop')

export function useStop<T>(x: T): [target: T, stop: () => void] {
  if (typeof x !== 'object' || typeof (x as any)[kStop] !== 'function') {
    if (typeof x === 'function') {
      return [
        x,
        () => {
          typeof (x as any)[kStop] !== 'function' ? x() : (x as any)[kStop]()
        },
      ]
    }

    return [x, () => {}]
  }

  const stop = (x as any)[kStop]

  return [
    x,
    () => {
      stop()
    },
  ]
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

export function isPlainObject(obj: object): obj is object {
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
  value: T
}

export type Accessor<T> = () => T

export type Setter<T> = (n: ((oldValue: T) => T) | T) => T

export type ValueAccessor<T> = [
  getter: Accessor<T>,
  setter: Setter<T>,
  target: Value<T>
]

export function useStopWith<T>(target: T, source: any): T {
  const [, stop] = useStop(source)
  setStopFn(target, stop)
  return target
}

export function useValue<T>(val: Value<T>): ValueAccessor<T> {
  return useStopWith(
    [() => getValue(val), ((f) => setValue<T>(val, f)) as Setter<T>, val],
    val
  )
}

export function useAccessor<T>(
  val: Value<T>
): [getter: Accessor<T>, target: Value<T>] {
  return useStopWith([() => getValue(val), val], val)
}

export function getValue<T>(val: Value<T>): T {
  return val.value
}

export function setValue<T>(v: Value<T>, newVal: ((oldValue: T) => T) | T): T {
  const oldValue = v.value

  if (typeof newVal === 'function') {
    v.value = (newVal as any)(oldValue)
  } else {
    v.value = newVal
  }

  return oldValue
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
    for (const key in value as any) {
      traverse(value[key], history)
    }
  }

  return value
}
