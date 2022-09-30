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
