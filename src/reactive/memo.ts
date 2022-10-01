import { track, notify, effect, execute, cleanup } from './effect'
import { setStopFn, setSymbolTag, setToStringTag } from './utils'

const kMemo = Symbol('kMemo')

export interface Memo<T> {
  readonly value: T
}

export function isMemo(memo: any): boolean {
  return typeof memo === 'object' && memo[kMemo] === true
}

export function useMemo<T>(getter: () => T): Memo<T> {
  return createMemo(getter)
}

export function createMemo<T>(getter: () => T): Memo<T> {
  let value: T
  let dirty = true

  const eff = effect(getter, {
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
  }

  setSymbolTag(memo, kMemo)
  setToStringTag(memo, 'Memo')
  setStopFn(memo, () => {
    cleanup(eff)
  })

  return memo
}
