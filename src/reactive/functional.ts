import {
  useMemo as useFnMemo,
  useReadonlyRef as useFnReadonlyRef,
  useRef as useFnRef,
  useSignal as useFnSignal,
  useValue as useFnValue,
} from './functional'
import { useRefs, getSignalRaw, toRefs, isSignal } from './signal'
import {
  effect,
  execute,
  track,
  notify,
  NotifyOps,
  schedule,
  cleanup,
  onCleanup,
} from './effect'
import { useMemo, isMemo } from './memo'
import {
  useReactive,
  useReadonly,
  useShallowReactive,
  useShallowReadonly,
  isReactive,
  getReactiveRaw,
} from './reactive'
import {
  /* internals */
  // useValue,
  // setValue,
  // getValue,
  // useAccessor,
  useStop,
  useStopWith,
} from './utils'
import { useWatch, useEffect } from './watch'
import { useDetachedScope, useScope, createScope, onScopeDipose } from './scope'

import type {
  WatchCallback,
  WatchOptions,
  UseEffectCallback,
  UseEffectOptions,
  WatchCallbackImmediate,
  WatchOptions1,
  WatchOptions2,
  WatchBasicOptions,
} from './watch'
import type { EffectScope } from './scope'
import type { Optional, Value, ValueAccessor, Accessor, Setter } from './utils'
import type {
  Effect,
  EffectFn,
  EffectOptions,
  Executor,
  Scheduler,
} from './effect'
import type { Signal, Refs, SignalOptions } from './signal'
import type { Memo, MemoOptions } from './memo'

export { useReadonlyRef, useRef, useSignal, useValue } from './fn'
export type {
  FunctionalMemo,
  FunctionalReadonly,
  FunctionalRef,
  FunctionalSignal,
  FunctionalValue,
  FunctionalReadonlyRef,
} from './fn'

export { useRefs, getSignalRaw, toRefs, isSignal }
export {
  effect,
  execute,
  track,
  notify,
  NotifyOps,
  schedule,
  cleanup,
  onCleanup,
}
export { useMemo, isMemo }
export {
  useReactive,
  useReadonly,
  useShallowReactive,
  useShallowReadonly,
  isReactive,
  getReactiveRaw,
}
export { useDetachedScope, useScope, createScope, onScopeDipose }
export { useWatch, useEffect }
export { useStop, useStopWith }
export { useFnMemo, useFnReadonlyRef, useFnRef, useFnSignal, useFnValue }

export type {
  WatchCallback,
  WatchOptions,
  UseEffectCallback,
  UseEffectOptions,
  WatchCallbackImmediate,
  WatchOptions1,
  WatchOptions2,
  WatchBasicOptions,
}
export type { EffectScope }
export type { Optional, Value, ValueAccessor, Accessor, Setter }
export type { Effect, EffectFn, EffectOptions, Executor, Scheduler }
export type { Signal, Refs, SignalOptions }
export type { Memo, MemoOptions }
