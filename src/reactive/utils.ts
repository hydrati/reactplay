export type Optional<T> = NonNullable<T> | undefined

export function setSymbolTag(obj: any, tag: symbol, value: any = true): any {
  return Object.defineProperty(obj, tag, {
    value,
    writable: false,
    configurable: false,
    enumerable: false,
  })
}

export function setToStringTag(obj: any, tag: string): any {
  return setSymbolTag(obj, Symbol.toStringTag, tag)
}

export function hasChanged(a: any, b: any): boolean {
  // eslint-disable-next-line no-self-compare
  return a !== b && (a === a || b === b)
}

export function queueMicrotask(fn: () => void): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Promise.resolve().then(fn)
}

export function traverse<T>(value: T, history: Set<any> = new Set()): T {
  if (typeof value !== 'object' || value == null || history.has(value)) {
    return value
  }

  history.add(value)

  for (const key in value) {
    traverse(value[key], history)
  }

  return value
}
