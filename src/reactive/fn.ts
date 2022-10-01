import { createMemo, MemoOptions } from './memo'
import { SignalOptions, createSignal, createRef } from './signal'
import {
  Accessor,
  Setter,
  useAccessor,
  useValue as createValue,
  Value,
} from './utils'

const kFunctionalValue = Symbol('kFunctionValue')

// eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/consistent-type-definitions
type Callable = { (): void }

export interface FunctionalValueObject<T> {
  readonly get: Accessor<T>
  readonly set: Setter<T>
  value: T
}

export type FunctionalValue<T> = Callable & FunctionalValueObject<T>

export interface FunctionalReadonlyObject<T> {
  readonly get: () => T
  readonly value: T
}

export type FunctionalReadonly<T> = Callable & FunctionalReadonlyObject<T>

function createRedirectHandler(target: any) {
  const proxyKeys = [
    'construct',
    'defineProperty',
    'deleteProperty',
    'getOwnPropertyDescriptor',
    'getPrototypeOf',
    'has',
    'isExtensible',
    'ownKeys',
    'preventExtensions',
    'setPrototypeOf',
  ] as const

  return Object.fromEntries(
    proxyKeys.map((key) => [
      key,
      (target: any, ...args: any[]) => (Reflect[key] as any)(target, ...args),
    ])
  )
}

export function createFunctionalValue<T>(val: Value<T>): FunctionalValue<T> {
  const [value, setValue] = createValue(getFunctionalValuwRaw(val))

  return new Proxy(value, {
    get(target, key, recv) {
      if (typeof key === 'symbol') {
        if (key === kFunctionalValue) {
          return val
        }

        return Reflect.get(target, key, recv)
      }

      if (key === 'get') {
        return value
      }

      if (key === 'set') {
        return setValue
      }

      return Reflect.get(target, key, recv)
    },
    set(target, key, newValue, recv) {
      if (target === recv && (key === 'set' || key === 'get')) {
        return false
      }

      return Reflect.set(target, key, newValue, recv)
    },
    ...createRedirectHandler(val),
  }) as any
}

export function useValue<T>(val: Value<T>, readonly?: false): FunctionalValue<T>
export function useValue<T>(
  val: Value<T>,
  readonly: true
): FunctionalReadonly<T>
export function useValue<T>(
  val: Value<T>,
  readonly: boolean = false
): FunctionalValue<T> | FunctionalReadonly<T> {
  return readonly ? createFunctionalReadonly(val) : createFunctionalValue(val)
}

export function createFunctionalReadonly<T>(
  val: Value<T>
): FunctionalReadonly<T> {
  const [value] = useAccessor(getFunctionalValuwRaw(val))
  return new Proxy(val, {
    get(target, key, recv) {
      if (typeof key === 'symbol') {
        if (key === kFunctionalValue) {
          return val
        }

        return Reflect.get(target, key, recv)
      }

      if (key === 'get') {
        return value
      }

      return Reflect.get(target, key, recv)
    },
    set(target, key, newValue, recv) {
      if (target === recv && (key === 'set' || key === 'get')) {
        return false
      }

      return Reflect.set(target, key, newValue, recv)
    },
    ...createRedirectHandler(val),
  }) as any
}

export type FunctionalSignal<T> = FunctionalValue<T>

export function useSignal<T>(
  initalValue: T,
  options?: SignalOptions<T>
): FunctionalSignal<T> {
  return createFunctionalValue(createSignal(initalValue, options))
}

export type FunctionalMemo<T> = FunctionalReadonly<T>

export function useMemo<T>(
  getter: () => T,
  initalValue: undefined,
  options?: MemoOptions<T>
): FunctionalMemo<T>
export function useMemo<T>(
  getter: (oldValue: T) => T,
  initalValue: T,
  options?: MemoOptions<T>
): FunctionalMemo<T>
export function useMemo<T>(
  getter: (oldValue?: T) => T,
  initalValue?: T,
  options?: MemoOptions<T>
): FunctionalMemo<T> {
  return createFunctionalReadonly(createMemo(getter, initalValue, options))
}

export type FunctionalRef<T> = FunctionalValue<T>

export function useRef<T extends object, K extends keyof T>(
  obj: T,
  key: K
): FunctionalRef<T[K]> {
  return createFunctionalValue(createRef(obj, key))
}

export type FunctionalReadonlyRef<T> = FunctionalReadonly<T>

export function useReadonlyRef<T extends object, K extends keyof T>(
  obj: T,
  key: K
): FunctionalReadonlyRef<T[K]> {
  return createFunctionalValue(createRef(obj, key, true))
}

export function isFunctionalValue(o: any): boolean {
  if (o[kFunctionalValue] != null) {
    return true
  } else {
    return false
  }
}

export function getFunctionalValuwRaw<T>(o: any): Value<T> {
  if (o[kFunctionalValue] != null) {
    return o[kFunctionalValue]
  } else {
    return o
  }
}
