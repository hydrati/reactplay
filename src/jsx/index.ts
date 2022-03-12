import { Functional } from './component';
import { Computed, isComputed } from '../stores/computed';
import { effect } from '../stores/deps';
import { isReactive } from '../stores/reactive';
import { isRef, Ref } from '../stores/ref';

export type Props<T = Record<PropertyKey, unknown>> = {
  readonly [K in keyof T]: Value<T[K]>
}
export type Lazy<T> = () => T
export type Value<T> = T | Ref<T> | Computed<T>
export type Child = (Node | Node[] | Value<string | number> | (() => Value<string | number>))

export function h<T = {}>(
  tag: string | typeof Fragment | Functional,
  props: Props<T> | null,
  ...children: Child[]
): Node {
  const p: Props<T> = props ?? {} as Props<T>

  if (tag === Fragment) {
    return createFragment(children)
  } else if (typeof tag === 'function') {
    return createFunctional(tag, p, children)
  } else {
    return createNativeElement(tag, p, children)
  }
}

export function resolveChild(child: Child): Node {
  if (child instanceof Node) {
    return child
  } else {
    return createTextNode(child)
  }
}

export function patchChildren(node: Node, children: Child[]): Node {
  for (const child of children) {
    if (Array.isArray(child)) {
      patchChildren(node, child)
    } else if (isRef(child) || isComputed(child) || typeof child === 'function') {
      node.appendChild(createTextNode(child))
    } else {
      if (child instanceof Node) node.appendChild(child)
      else node.appendChild(createTextNode(child))
    }
  }

  return node
}

export function createNativeElement<T = {}>(tag: string, props: Props<T>, children: Child[]) {
  const node = document.createElement(tag)
  patchProps(node, props)
  patchChildren(node, children)
  return node
}

export function createFragment(children: Child[]) {
  const node = document.createDocumentFragment()
  patchChildren(node, children)
  return node
}

export function createFunctional<T>(f: Functional<T>, props: Props<T>, children: Child[]) {
  return f({
    children: () => createFragment(children),
    props
  })
}

export function patchProps<T>(node: any, props: Props<T>): Node {
  for (const [key, value] of Object.entries(props)) {
    if (isComputed(value) || isRef(value)) {
      effect(() => {
        const k = key
        node[k] = (value as Ref<unknown>).value
      })
    } else {
      node[key] = value
    }
  }

  return node
}

export function toText(val: any): string {
  const text = val?.toString?.()

  if (typeof text !== "string") {
    return Object.toString.call(text)
  }

  return text
}

export function createTextNode<T>(val: Value<T>) {
  if (isRef(val) || isComputed(val)) {
    const n = document.createTextNode("")
    effect(() => {
      n.textContent = toText((val as Ref<unknown>).value)
    })
    return n
  } else if (typeof val === 'function') {
    const n = document.createTextNode("")
    effect(() => {
      n.textContent = toText(val())
    })
    return n
  } else {
    return document.createTextNode(toText(val))
  }
}

export const Fragment = Symbol('Exact.Fragment')

export function mount(el: string, node: Node | Functional) {
  if (typeof node === 'function') {
    node = createFunctional(node, {}, [])
  }
  document.querySelector(el)?.appendChild(node)
}

export * from './component'