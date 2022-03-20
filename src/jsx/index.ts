import { ComponentFactory, Functional } from './component';
import { Computed, isComputed } from '../store/computed';
import { Effect, effect, watchEffect, WatchEffectFn } from '../store/deps';
import { isReactive } from '../store/reactive';
import { VFragment, createFragment } from './fragment'
import { isRef, Ref } from '../store/ref';

export { VFragment, createFragment }

export type Props<T = Record<PropertyKey, unknown>> = {
  readonly [K in keyof T]: Value<T[K]>
}
export type Lazy<T> = () => T
export type Value<T> = T | Ref<T> | Computed<T>
export type Child = (Node | Node[] | Value<string | number> | (() => Value<string | number>))

export function h<T>(
  tag: ComponentFactory<T>,
  props: T | null,
  ...children: Child[]
): Node 
export function h<T>(
  tag: string | typeof Fragment,
  props: Props<T> | T | null,
  ...children: Child[]
): Node 
export function h<T>(
  tag: string | typeof Fragment | ComponentFactory<T> | Node,
  props: Props<T> | T | null,
  ...children: Child[]
): Node {
  const p: Props<T> = props ?? {} as Props<T>

  if (tag === Fragment) {
    // return (createFragment(children))
    return (createFragment(children))
  } else if (typeof tag === 'function') {
    return (createComponent(tag, p as T, children))
  } else if (tag instanceof Node) {
    return (tag)
  } else {
    return (createNativeElement(tag, p, children))
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

export function createNativeElement<T = {}>(tag: string, props: Props<T>, children: Child[]): HTMLElement {
  const node = document.createElement(tag)
  patchProps(node, props)
  patchChildren(node, children)
  return node
}

// export function createFragment(children: Child[]) {
//   const node = document.createDocumentFragment()
//   patchChildren(node, children)
//   return node
// }

export function createComponent<T>(f: ComponentFactory<T>, props: T, children: Child[]) {
  return f(props)({
    children: () => createFragment(children)
  })
}

export function patchProps<T>(node: HTMLElement, props: Props<T>): HTMLElement {
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) {
      const finalName = key.replace(/Capture$/, "");
      const useCapture = key !== finalName;
      const eventName = finalName.toLowerCase().substring(2);
      node.addEventListener(eventName, value as EventListenerOrEventListenerObject, useCapture);
    } else {
      if (key.startsWith('v-')) {
        if (key == 'v-ref' && isRef(value)) {
          (value as Ref<Node | null>).value = node;
          (props as any)[key] = undefined
          continue
        }
      }

      if (isComputed(value) || isRef(value)) {
        const k = key
        autoDisposeEffect(() => { 
          node.setAttribute(k, toText((value as Ref<unknown>).value))
        }, node)
      } else {
        node.setAttribute(key, toText(value))
      }
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

function _createTextNode<T>(val: Value<T>) {
  if (isRef(val) || isComputed(val)) {
    const n = document.createTextNode("")
    autoDisposeEffect(() => {
      n.textContent = toText((val as Ref<unknown>).value)
    }, n)
    return n
  } else if (typeof val === 'function') {
    const n = document.createTextNode("")
    autoDisposeEffect(() => {
      n.textContent = toText(val())
    }, n)
    return n
  } else {
    return document.createTextNode(toText(val))
  }
}

export function createTextNode<T>(val: Value<T>) {
  return (_createTextNode(val))
}


export function autoDisposeEffect(f: Effect, node: Node) {
  let once = false
  
  
  const dispose = watchEffect((i) => {
    if (node.parentElement == null && once) {
      dispose()
    }
    if (!once) once = true
    f()
  })


}

export const Fragment = Symbol('JSX.Fragment')

export function mount(el: string, node: Node | ComponentFactory<{}>) {
  if (typeof node === 'function') {
    node = createComponent(node, {}, [])
  }
  document.querySelector(el)?.append(node)
  // console.log('append', node)
}

export * from './component'