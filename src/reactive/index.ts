import {
  useRefs,
  useSignal,
  getSignalRaw,
  useRef,
  useReadonlyRef,
  toRefs,
  isSignal,
} from './signal'
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
  FunctionalMemo,
  FunctionalReadonly,
  FunctionalReadonlyRef,
  FunctionalRef,
  FunctionalSignal,
  FunctionalValue,
} from './fn'
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
  Bucket,
} from './effect'
import type { Signal, Refs, SignalOptions } from './signal'
import type { Memo, MemoOptions } from './memo'
export { useMemo, isMemo } from './memo'
export {
  useMemo as useFnMemo,
  useReadonlyRef as useFnReadonlyRef,
  useRef as useFnRef,
  useSignal as useFnSignal,
  useValue as useFnValue,
} from './fn'

export {
  useRefs,
  useSignal,
  getSignalRaw,
  useRef,
  useReadonlyRef,
  toRefs,
  isSignal,
}
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

export type {
  FunctionalMemo,
  FunctionalReadonly,
  FunctionalReadonlyRef,
  FunctionalRef,
  FunctionalSignal,
  FunctionalValue,
}
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
export type { Effect, EffectFn, EffectOptions, Executor, Scheduler, Bucket }
export type { Signal, Refs, SignalOptions }
export type { Memo, MemoOptions }
