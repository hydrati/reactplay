import { track, notify, effect, execute, cleanup } from './effect'
import { kSignal, kSignalRaw } from './signal'
import { setStopFn, setSymbolTag, setToStringTag } from './utils'

const kMemo = Symbol('kMemo')

export interface Memo<T> {
  readonly value: T
}

export function isMemo(memo: any): boolean {
  return typeof memo === 'object' && memo[kMemo] === true
}

export function useMemo<T>(getter: () => T, initalValue?: T): Memo<T>
export function useMemo<T>(getter: (oldValue: T) => T, initalValue: T): Memo<T>
export function useMemo<T>(
  getter: (oldValue?: T) => T,
  initalValue?: T
): Memo<T> {
  return createMemo(getter)
}

export function createMemo<T>(getter: () => T, initalValue?: T): Memo<T>
export function createMemo<T>(
  getter: (oldValue: T) => T,
  initalValue: T
): Memo<T>
export function createMemo<T>(
  getter: (oldValue?: T) => T,
  initalValue?: T
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

  const memo = {
    get value() {
      if (dirty) {
        const newValue = execute(eff)
        if (newValue != null) {
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
