import { cleanup, Effect } from './effect'
import { Optional, setStopFn } from './utils'

export let activeScope: Optional<EffectScopeImpl>
export const kScopeChildren = Symbol('kScopeChildren')
export const kScopeEffect = Symbol('kScopeEffect')
export const kScopeDiposeCallback = Symbol('kScopeDiposeCallback')

export function onScopeDipose(fn: () => void): () => void {
  if (activeScope != null) {
    const scope = activeScope
    scope[kScopeDiposeCallback].add(fn)
    return () => {
      if (scope[kScopeDiposeCallback].has(fn)) {
        scope[kScopeDiposeCallback].delete(fn)
      }
    }
  }

  return () => {}
}

export class EffectScopeImpl {
  public [kScopeChildren]: Set<EffectScopeImpl> = new Set()
  public [kScopeEffect]: Set<Effect> = new Set()
  public [kScopeDiposeCallback]: Set<() => void> = new Set()

  constructor(public readonly detached: boolean = false) {
    if (!detached) {
      activeScope?.[kScopeChildren].add(this)
    }

    setStopFn(this, this.stop.bind(this))
  }

  run(fn: () => void): void {
    const oldScope = activeScope

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeScope = this

    fn()
    activeScope = oldScope
  }

  stop(): void {
    this[kScopeDiposeCallback].forEach((v) => {
      v()
    })

    this[kScopeEffect].forEach((v) => {
      cleanup(v)
      this[kScopeEffect].delete(v)
    })

    this[kScopeChildren].forEach((v) => v.stop())
  }

  get size(): number {
    return this[kScopeEffect].size
  }
}

export interface EffectScope {
  run: (f: () => void) => void
  stop: () => void
  readonly size: number
}

export function createScope(detached?: boolean): EffectScope {
  return new EffectScopeImpl(detached)
}

export function useScope(fn: () => void, detached?: boolean): () => void {
  const scope = createScope(detached)
  scope.run(fn)
  return () => {
    scope.stop()
  }
}

export function useDetachedScope(fn: () => void): () => void {
  return useScope(fn, true)
}
