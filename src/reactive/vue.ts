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
import { useMemo, isMemo } from './memo'
import {
  useReactive,
  useReadonly,
  useShallowReactive,
  useShallowReadonly,
  isReactive,
  getReactiveRaw,
} from './reactive'
import { useStop, useStopWith } from './utils'
import { useWatch, useEffect } from './watch'
import { createScope, onScopeDipose } from './scope'

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
import type { Optional, Value } from './utils'
import type {
  Effect,
  EffectFn,
  EffectOptions,
  Executor,
  Scheduler,
} from './effect'
import type { Signal, Refs, SignalOptions } from './signal'
import type { Memo } from './memo'

export {
  useRefs as refs,
  useSignal as ref,
  getSignalRaw as getRefRaw,
  useRef as toRef,
  useReadonlyRef as toReadonlyRef,
  toRefs,
  isSignal as isRef,
}
export {
  effect,
  execute,
  track,
  notify as trigger,
  NotifyOps,
  schedule,
  cleanup,
  onCleanup,
}
export { useMemo as computed, isMemo as isComputed }
export {
  useReactive as reactive,
  useReadonly as readonly,
  useShallowReactive as shallowReactive,
  useShallowReadonly as shallowReadonly,
  isReactive,
  getReactiveRaw,
}
export { createScope as effectScope, onScopeDipose }
export { useWatch as watch, useEffect as watchEffect }
export { useStop as stop, useStopWith as stopWith }

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
export type { Optional, Value }
export type { Effect, EffectFn, EffectOptions, Executor, Scheduler }
export type { Signal as Ref, Refs, SignalOptions as RefOptions }
export type { Memo as Computed }
