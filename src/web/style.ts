import { isPlainObject } from '../reactive/utils'
import { toKebab } from './utils'

export function toRawStyle(style: Partial<CSSStyleDeclaration>): string {
  const s = []
  for (const key in style) {
    if (style[key] != null) {
      s.push(`${toKebab(key)}:${style[key] ?? 'unset'};`)
    }
  }

  return s.join('')
}

export type ClassName = string | Record<string, boolean> | string[]

export function normalizeClassName(ones: string): string {
  return [...new Set(ones.split(/\s+/))].map((v) => v.trim()).join(' ')
}

export function toRawClassName(name: ClassName): string {
  if (typeof name === 'string') {
    return normalizeClassName(name)
  } else if (Array.isArray(name)) {
    return name.map((v) => normalizeClassName(v)).join(' ')
  } else if (isPlainObject(name)) {
    const names = new Set()
    for (const key in name) {
      const s = key.split(/\s+/).map((v) => v.trim())
      if (name[key]) {
        s.forEach((n) => names.add(n))
      } else {
        s.forEach((n) => names.delete(n))
      }
    }
    return [...names].join(' ')
  } else {
    return ''
  }
}

export function useClass(target: Element, name: () => ClassName): () => void {
  return () => {
    setClass(target, name())
  }
}

export function useStyle(
  target: Element,
  style: () => Partial<CSSStyleDeclaration> | string
): () => void {
  return () => {
    setStyle(target, style())
  }
}

export function setStyle(
  target: Element,
  style: Partial<CSSStyleDeclaration> | string
): Element {
  target.setAttribute(
    'style',
    typeof style === 'string' ? style : toRawStyle(style)
  )
  return target
}

export function setClass(target: Element, name: ClassName): Element {
  target.className = toRawClassName(name)
  return target
}
