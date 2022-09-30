import { activeScope, kScopeEffect } from './scope'
import { Optional } from './utils'

export type EffectFn<T = any> = () => T
export type Executor<U = any> = <T = U>(effect: Effect<T>) => Optional<T>
export type Scheduler<U = any> = <T = U>(effect: Effect<T>, op: number) => void

export const kIteration = Symbol('kIteration')

export const NotifyOps = {
  Set: 0,
  Delete: 1,
  Add: 2,
  Iterate: 3,
}

export interface EffectOptions {
  executor?: Executor
  scheduler?: Scheduler
  lazy?: boolean
}

export interface Effect<T = any> {
  effect: EffectFn<T>
  deps?: Set<Bucket>
  options?: EffectOptions
  oncleanup?: Set<() => void>
}

let shouldTrack: boolean = true

let activeEffect: Optional<Effect>
const effectStack: Effect[] = []

export type Bucket = Set<Effect>
export type Store = Map<any, Bucket>
export type Target = any

// target -> store -> bucket
export type TargetMap = WeakMap<Target, Store>

const targetMap: TargetMap = new WeakMap()

export function schedule<T>(eff: Effect<T>, op: number): void {
  if (eff.options?.scheduler != null) {
    eff.options?.scheduler(eff, op)
  } else {
    execute(eff)
  }
}

export function execute<T>(eff: Effect<T>): Optional<T> {
  cleanup(eff)

  const oldShouldTrack = shouldTrack
  shouldTrack = true

  activeEffect = eff
  effectStack.push(eff)

  let returnValue: Optional<T>
  if (eff.options?.executor != null) {
    returnValue = eff.options.executor(eff)
  } else {
    returnValue = eff.effect()
  }

  shouldTrack = oldShouldTrack

  effectStack.pop()
  activeEffect = effectStack[effectStack.length - 1]

  return returnValue
}

export function effect<T>(fn: EffectFn<T>, options?: EffectOptions): Effect<T> {
  const eff: Effect = { effect: fn, options }

  if (activeScope != null) {
    activeScope[kScopeEffect].add(eff)
  }

  if (options?.lazy !== true) {
    execute(eff)
  }

  return eff
}

export function track<T extends Target>(target: T, key: any): void {
  if (activeEffect == null || !shouldTrack) return

  let store = targetMap.get(target)
  if (store == null) {
    store = new Map() as Store
    targetMap.set(target, store)
  }

  let bucket = store.get(key)
  if (bucket == null) {
    bucket = new Set() as Bucket
    store.set(key, bucket)
  }

  bucket.add(activeEffect)

  activeEffect.deps ??= new Set()
  activeEffect.deps.add(bucket)
}

function hasChangedKeys(op: number): boolean {
  return op === NotifyOps.Add || op === NotifyOps.Delete
}

function extractBucket<T extends Target>(
  shouldExecute: Bucket,
  target: T,
  key: any,
  isShould?: (eff: Effect) => boolean
): void {
  const bucket = targetMap.get(target)?.get(key)
  if (bucket != null) {
    bucket.forEach((eff) => {
      if (eff !== activeEffect && (isShould?.(eff) ?? true)) {
        shouldExecute.add(eff)
      }
    })
  }
}

export function notify<T extends Target>(
  target: T,
  key: any,
  op: number = NotifyOps.Set,
  newIndex?: number
): void {
  const shouldExecute = new Set() as Bucket
  let shouldNotify = true
  // console.log('notify', target, key, op, newIndex)

  if (Array.isArray(target)) {
    if (hasChangedKeys(op)) {
      if (op === NotifyOps.Add) {
        shouldNotify = false
      } else {
        extractBucket(shouldExecute, target, 'length')
      }
    } else if (key === 'length' && newIndex != null) {
      const store = targetMap.get(target)
      if (store != null) {
        store.forEach((bucket, key) => {
          const index = Number(key)
          if (!Number.isNaN(index) && index >= newIndex) {
            extractBucket(shouldExecute, target, key)
          }
        })
      }
    }
  } else if (hasChangedKeys(op)) {
    extractBucket(shouldExecute, target, kIteration)
  }

  if (shouldNotify) {
    extractBucket(shouldExecute, target, key)
  }

  shouldExecute.forEach((eff) => schedule(eff, op))
}

export function onCleanup(fn: () => void): Optional<() => void> {
  if (activeEffect != null) {
    const eff = activeEffect
    eff.oncleanup ??= new Set()
    eff.oncleanup.add(fn)
    return () => {
      eff.oncleanup?.delete(fn)
    }
  }
}

export function cleanup(eff: Effect): void {
  eff.oncleanup?.forEach((v) => v())

  if (eff.deps != null) {
    for (const dep of eff.deps) {
      eff.deps.delete(dep)
      dep.delete(eff)
    }
  }
}

export function preventTrack<T>(fn: () => T): T {
  shouldTrack = false
  const returnValue = fn()
  shouldTrack = true

  return returnValue
}
