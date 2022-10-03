import { useEffect } from '../reactive'
import { useInsertAttr } from './reactive'

export function valToString(v: any): string {
  if (typeof v === 'string') {
    return v
  }
  if (typeof v.toString === 'function') {
    return valToString(v.toString())
  }
  return Object.prototype.toString.call(v)
}

export function insertBefore(
  target: Element,
  before: Node | Element,
  child: Node | Element
): Element {
  target.insertBefore(before, child)
  return target
}

export function insertAt<T extends Node>(target: T, child: Node, n: number): T {
  if (n > target.childNodes.length - 1) {
    useAppend(target, child)
  } else {
    target.insertBefore(child, useChildAt(target, n))
  }
  return target
}

export function replaceAt<T extends Node>(
  target: T,
  child: Node,
  n: number
): T {
  target.replaceChild(useChildAt(target, n), child)
  return target
}

export function replaceChild<T extends Node>(
  target: T,
  old: Node,
  child: Node
): T {
  target.replaceChild(old, child)
  return target
}

export function useComment(n: Node, c?: string | number): Comment | undefined {
  let o: Comment | undefined
  for (let i = n.firstChild; i != null; i = i.nextSibling) {
    if (
      i.nodeType === i.COMMENT_NODE &&
      (c == null || i.textContent === c.toString())
    ) {
      o = i as Comment
      break
    }
  }

  return o
}

export function replaceWith(target: Element, r: Element): Element {
  if (target instanceof Element) {
    target.replaceWith(r)
  } else {
    throw new Error('Target is not a element')
  }

  return r
}

export function useChildAt<T extends Node>(target: T, n: number): ChildNode {
  const o = target.childNodes.item(n)
  if (o == null) {
    throw new Error(`Not found child at ${n}`)
  }

  return o
}

export function useHTML<T extends Element>(
  target: T,
  innerHTML: string,
  check = false
): T {
  if (target instanceof Element) {
    target.innerHTML = innerHTML
  } else if (check) {
    throw new Error('Target is not a element')
  }

  return target
}

export function toKebab(camel: string): string {
  const first = camel.match(/^([a-z]+)([A-Z].*)$/)
  if (first == null || first.length < 3) {
    return camel.toLowerCase()
  } else {
    return [first[1], ...(first[2].match(/([A-Z][a-z]*)/g) ?? [])]
      .map((v) => v.toLowerCase())
      .join('-')
  }
}

export type AppendElement =
  | Node
  | string
  | (() => AppendElement)
  | AppendElement[]

export type Fragment = DocumentFragment

export function useFragment(...children: AppendElement[]): Fragment {
  const template = document.createElement('template')
  return useAppend(template.content, ...children)
}

export function setAttribute<E extends Element>(n: E, k: string, v: any): E {
  n.setAttribute(k, valToString(v))
  return n
}

export function setAttributeNS<E extends Element>(
  n: E,
  ns: string,
  k: string,
  v: any
): E {
  n.setAttributeNS(ns, k, valToString(v))
  return n
}

export function appendText<E extends Node>(n: E, ...text: any[]): E {
  for (const t of text) {
    n.appendChild(document.createTextNode(valToString(t)))
  }
  return n
}

export function createComment(c: any): Comment {
  return document.createComment(c)
}

const kFragment = Symbol('kFragment')
const kComment = Symbol('kComment')
export { kFragment as Fragment, kComment as Comment }

export function h(
  tag: typeof kFragment,
  props?: null | {},
  ...children: AppendElement[] | Array<() => AppendElement>
): () => Fragment
export function h(
  tag: typeof kComment,
  props?: null | {},
  ...children: [any]
): () => Comment
export function h(
  tag: string,
  props?: Record<string, any | (() => any)> | null,
  ...children: AppendElement[] | Array<() => AppendElement>
): () => Element
export function h(
  tag: string | symbol,
  props?: Record<string, any | (() => any)> | null,
  ...children: AppendElement[] | Array<() => AppendElement> | [any]
): () => Node {
  if (typeof tag === 'symbol') {
    if (tag === kFragment) {
      return () => useFragment(...children)
    } else if (tag === kComment) {
      return () => createComment(valToString(children[0] ?? ''))
    } else {
      throw new Error('Not found this symbol element')
    }
  }

  const el = document.createElement(tag)
  const dynProps = props != null ? new Set<string>() : undefined
  if (props != null) {
    for (const key in props) {
      if (typeof props[key] !== 'function') {
        setAttribute(el, key, props[key])
      } else {
        dynProps?.add(key)
      }
    }
  }
  return () => {
    const e = el.cloneNode(true) as Element

    if (props != null && dynProps != null) {
      for (const key of dynProps) {
        if (typeof props[key] === 'function') {
          useEffect(useInsertAttr(e, key, props[key]))
        }
      }
    }

    useAppend(e, ...children)

    return e
  }
}

export function useAppend<T extends Node>(
  target: T,
  ...children: AppendElement[]
): T {
  for (const child of children) {
    if (child instanceof Node) {
      target.appendChild(child)
    } else if (typeof child === 'string') {
      target.appendChild(document.createTextNode(child))
    } else if (Array.isArray(child)) {
      child.forEach((v) => useAppend(target, v))
    } else if (typeof child === 'function') {
      useAppend(target, child())
    }
  }
  return target
}
