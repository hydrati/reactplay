import { effect, cleanup, EffectOptions, execute, schedule } from './effect'
import { hasChanged, Optional, traverse, queueMicrotask } from './utils'

export type WatchCallback<T> = (
  oldValue: T,
  newValue: T,
  onInvalidate: (fn: () => void) => void,
  stop: () => void
) => void

export type WatchCallbackImmediate<T> = (
  oldValue: Optional<T>,
  newValue: T,
  onInvalidate: (fn: () => void) => void,
  stop: () => void
) => void

export interface WatchBasicOptions {
  flush?: 'sync' | 'post'
  shallow?: boolean
  onNotify?: EffectOptions['onNotify']
  onTrack?: EffectOptions['onTrack']
  onCleanup?: EffectOptions['onCleanup']
}

export type WatchOptions = WatchOptions1 | WatchOptions2
export type WatchOptions1 = WatchBasicOptions & { immediate?: false }
export type WatchOptions2 = WatchBasicOptions & { immediate: true }

export function useWatch<T>(
  dep: () => T,
  callback: WatchCallback<T>
): () => void
export function useWatch<T>(
  dep: () => T,
  callback: WatchCallback<T>,
  options: WatchOptions1
): () => void
export function useWatch<T>(
  dep: () => T,
  callback: WatchCallbackImmediate<T>,
  options: WatchOptions2
): () => void
export function useWatch<T>(
  dep: () => T,
  callback: WatchCallbackImmediate<T>,
  options: WatchOptions = {}
): () => void {
  const getter = options?.shallow === true ? dep : () => traverse(dep())

  let oldValue: Optional<T>
  let onInvalidate: Optional<() => void>
  const setOnInvalidate = (fn: () => void): void => {
    onInvalidate = fn
  }

  const stop = (): void => {
    cleanup(eff)
  }

  const emit = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newValue = execute(eff)!

    if (hasChanged(oldValue, newValue)) {
      onInvalidate?.()
      onInvalidate = undefined

      if (options?.flush === 'post') {
        queueMicrotask(() =>
          callback(oldValue, newValue, setOnInvalidate, stop)
        )
      } else {
        callback(oldValue, newValue, setOnInvalidate, stop)
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

  if (options.immediate !== true) {
    oldValue = getter()
    schedule(eff)
  } else {
    schedule(eff)
  }

  console.log(eff)

  return stop
}

export type UseEffectCallback = (
  onInvalidate: (fn: () => void) => void,
  stop: () => void
) => void

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

  const stop = (): void => {
    cleanup(eff)
  }

  const eff = effect(
    () => {
      callback(setOnInvalidate, stop)
    },
    {
      scheduler: emit,
      onNotify: options?.onNotify,
      onTrack: options?.onTrack,
      onCleanup: options?.onCleanup,
    }
  )

  return stop
}
