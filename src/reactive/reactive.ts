import { kIterator, kReactive, kReactiveRaw } from './constants'
import { track, notify, NotifyOps, useNotrack } from './effect'
import { hasChanged, isPlainObject } from './utils'

export function isReactive(obj: any): boolean {
  return typeof obj === 'object' && obj[kReactive] === true
}

export function getReactiveRaw<T extends object>(obj: T): T {
  return isReactive(obj) ? (obj as any)[kReactiveRaw] : obj
}

export function useReactive<T extends object>(obj: T): T {
  return createReactive(getReactiveRaw(obj))
}

export function useShallowReactive<T extends object>(obj: T): T {
  return createReactive(getReactiveRaw(obj), true)
}

export function useReadonly<T extends object>(obj: T): Readonly<T> {
  return createReactive(getReactiveRaw(obj), false, true)
}

export function useShallowReadonly<T extends object>(obj: T): Readonly<T> {
  return createReactive(getReactiveRaw(obj), true, true)
}

export function createReactive<T extends object>(
  obj: T,
  shallow = false,
  readonly = false
): T {
  if (typeof obj !== 'object') {
    return obj
  } else if (Array.isArray(obj)) {
    return createReactiveArray(obj, shallow, readonly)
  } else if (isPlainObject(obj)) {
    return createReactiveObject(obj, shallow, readonly)
  } else {
    console.warn(
      'warn: create reactive objects from objects with unknown prototype'
    )
    return createReactiveObject(obj, shallow, readonly)
  }
}

function createProxiedArrayMethods(): any {
  const arrayPreventTrackMethods = ['push', 'pop', 'shift', 'unshift', 'splice']
  const arrayRetryThisMethods = ['includes', 'indexOf', 'lastIndexOf']
  const arrayProxiedMethods: any = Object.create(null)
  for (const key of arrayPreventTrackMethods) {
    arrayProxiedMethods[key] = function (...args: any[]) {
      return useNotrack(() => Array.prototype[key as any].apply(this, args))
    }
  }

  for (const key of arrayRetryThisMethods) {
    arrayProxiedMethods[key] = function (...args: any[]) {
      let returnValue = Array.prototype[key as any].apply(this, args)
      if (returnValue === false || returnValue === -1) {
        returnValue = Array.prototype[key as any](getReactiveRaw(this))
      }
      return returnValue
    }
  }

  return arrayProxiedMethods
}

const proxiedArrayMethods = createProxiedArrayMethods()

export function createReactiveArray<T extends unknown[]>(
  obj: T,
  shallow = false,
  readonly = false
): T {
  const proxied = new Proxy(obj, {
    get(target, key, recv) {
      if (proxiedArrayMethods[key] != null) {
        return proxiedArrayMethods[key]
      }

      if (key === kReactiveRaw) {
        return target
      }

      if (key === kReactive) {
        return true
      }
      if (typeof key !== 'symbol') {
        track(target, key)
      }

      const value = Reflect.get(target, key, recv)
      return shallow || value == null || typeof value !== 'object'
        ? value
        : createReactive(obj, false, readonly)
    },
    set(target, key, newValue, recv) {
      if (readonly) {
        console.warn('[warn] reactive object is readonly!')
        return true
      }

      const oldValue = (target as any)[key]

      const hasIndex = Array.isArray(target)
        ? Number(key) < target.length
        : Reflect.has(target, key)

      const returnValue = Reflect.set(target, key, newValue, recv)
      if (target === getReactiveRaw(recv)) {
        if (key === 'length') {
          notify(target, key, NotifyOps.Set, newValue)
        } else if (hasIndex) {
          if (hasChanged(newValue, oldValue)) {
            notify(target, key, NotifyOps.Set)
          }
        } else {
          notify(target, key, NotifyOps.Add)
        }
      }
      return returnValue
    },
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : kIterator)
      return Reflect.ownKeys(target)
    },
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    deleteProperty(target, key) {
      if (readonly) {
        console.warn('[warn] reactive object is readonly!')
        return true
      }

      const returnValue = Reflect.deleteProperty(target, key)

      notify(target, key, NotifyOps.Delete)

      return returnValue
    },
  })

  return proxied
}

export function createReactiveObject<T extends object>(
  obj: T,
  shallow = false,
  readonly = false
): T {
  const proxied = new Proxy(obj, {
    get(target, key, recv) {
      if (key === kReactiveRaw) {
        return target
      }
      if (key === kReactive) {
        return true
      }

      if (typeof key !== 'symbol') {
        track(target, key)
      }

      const value = Reflect.get(target, key, recv)
      return shallow || value == null || typeof value !== 'object'
        ? value
        : createReactive(obj, false, readonly)
    },
    set(target, key, newValue, recv) {
      if (readonly) {
        console.warn('[warn] reactive object is readonly!')
        return true
      }

      const hasKey = Reflect.has(target, key)
      const oldValue = (target as any)[key]
      const returnValue = Reflect.set(target, key, newValue, recv)
      if (target === getReactiveRaw(recv)) {
        if (hasKey) {
          if (hasChanged(newValue, oldValue)) {
            notify(target, key, NotifyOps.Set)
          }
        } else {
          notify(target, key, NotifyOps.Add)
        }
      }
      return returnValue
    },
    ownKeys(target) {
      track(target, kIterator)
      return Reflect.ownKeys(target)
    },
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    deleteProperty(target, key) {
      if (readonly) {
        console.warn('[warn] reactive object is readonly!')
        return true
      }

      const returnValue = Reflect.deleteProperty(target, key)

      notify(target, key, NotifyOps.Delete)

      return returnValue
    },
  })

  return proxied
}
