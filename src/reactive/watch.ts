import { effect, cleanup, EffectOptions } from './effect'
import { hasChanged, Optional, traverse, queueMicrotask } from './utils'

export type WatchCallback<T> = (
  oldValue: T,
  newValue: T,
  onInvalidate: (fn: () => void) => void
) => void

export interface WatchOptions {
  flush?: 'sync' | 'post'
  shallow?: boolean
  immediate?: boolean
  onNotify?: EffectOptions['onNotify']
  onTrack?: EffectOptions['onTrack']
  onCleanup?: EffectOptions['onCleanup']
}

export function watch<T>(
  getter: () => T,
  callback: WatchCallback<T>,
  options: WatchOptions = {}
): () => void {
  getter = options?.shallow === true ? getter : () => traverse(getter())

  let oldValue: T
  let onInvalidate: Optional<() => void>
  const setOnInvalidate = (fn: () => void): void => {
    onInvalidate = fn
  }

  const emit = (): void => {
    const newValue = eff.effect()
    if (hasChanged(oldValue, newValue)) {
      onInvalidate?.()
      onInvalidate = undefined

      if (options?.flush === 'post') {
        queueMicrotask(() => callback(oldValue, newValue, setOnInvalidate))
      } else {
        callback(oldValue, newValue, setOnInvalidate)
      }
      oldValue = newValue
    }
  }

  const eff = effect(getter, {
    lazy: true,
    scheduler: emit,
    onNotify: options?.onNotify,
    onTrack: options?.onTrack,
    onCleanup: options?.onCleanup,
  })

  if (options.immediate !== false) {
    emit()
  } else {
    oldValue = getter()
  }

  return () => {
    cleanup(eff)
  }
}

export type UseEffectCallback = (onInvalidate: (fn: () => void) => void) => void

export interface UseEffectOptions {
  flush?: 'sync' | 'post'
  onNotify?: EffectOptions['onNotify']
  onTrack?: EffectOptions['onTrack']
  onCleanup?: EffectOptions['onCleanup']
}

export function useEffect(
  callback: UseEffectCallback,
  options: UseEffectOptions = {}
): () => void {
  let onInvalidate: Optional<() => void>
  const setOnInvalidate = (fn: () => void): void => {
    onInvalidate = fn
  }

  const emit = (): void => {
    onInvalidate?.()
    onInvalidate = undefined

    if (options?.flush === 'post') {
      queueMicrotask(() => eff.effect())
    } else {
      eff.effect()
    }
  }

  const eff = effect(
    () => {
      callback(setOnInvalidate)
    },
    {
      scheduler: emit,
      onNotify: options?.onNotify,
      onTrack: options?.onTrack,
      onCleanup: options?.onCleanup,
    }
  )

  return () => {
    cleanup(eff)
  }
}
