import { track, notify, effect, execute, cleanup } from './effect'
import { kSignal, kSignalRaw } from './signal'
import { hasChanged, setStopFn, setSymbolTag, setToStringTag } from './utils'

const kMemo = Symbol('kMemo')

export interface Memo<T> {
  readonly value: T
}

export function isMemo(memo: any): boolean {
  return typeof memo === 'object' && memo[kMemo] === true
}

export interface MemoOptions<T> {
  equals: false | ((oldValue: T, newValue: T) => boolean)
}

export function useMemo<T>(
  getter: () => T,
  initalValue: undefined,
  options?: MemoOptions<T>
): Memo<T>
export function useMemo<T>(
  getter: (oldValue: T) => T,
  initalValue: T,
  options?: MemoOptions<T>
): Memo<T>
export function useMemo<T>(
  getter: (oldValue?: T) => T,
  initalValue?: T,
  options?: MemoOptions<T>
): Memo<T> {
  return createMemo(getter, initalValue, options)
}

export function createMemo<T>(
  getter: () => T,
  initalValue?: T,
  options?: MemoOptions<T>
): Memo<T>
export function createMemo<T>(
  getter: (oldValue: T) => T,
  initalValue: T,
  options?: MemoOptions<T>
): Memo<T>
export function createMemo<T>(
  getter: (oldValue?: T) => T,
  initalValue?: T,
  options?: MemoOptions<T>
): Memo<T> {
  let value: T
  let dirty = true

  if (initalValue != null) {
    value = initalValue
  }

  const eff = effect(() => getter(value), {
    lazy: true,
    scheduler: (effect) => {
      if (!dirty) {
        dirty = true
        notify(memo, 'value')
      }
    },
  })

  const changed =
    typeof options?.equals === 'function' ? options?.equals : hasChanged

  const memo = {
    get value() {
      if (dirty) {
        const newValue = execute(eff) as T
        if (options?.equals === false || changed(value, newValue)) {
          value = newValue
        }
        dirty = false
      }

      track(memo, 'value')
      return value
    },
    set value(_) {},
    get [kSignalRaw]() {
      return value
    },
  }

  setSymbolTag(memo, kMemo)
  setSymbolTag(memo, kSignal)
  setToStringTag(memo, 'Memo')
  setStopFn(memo, () => {
    cleanup(eff)
  })

  return memo
}
