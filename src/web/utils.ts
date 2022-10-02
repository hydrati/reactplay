export function valToString(v: any): string {
  if (typeof v === 'string') {
    return v
  }
  if (typeof v.toString === 'function') {
    return valToString(v.toString())
  }
  return Object.prototype.toString.call(v)
}

export function appendChild(
  target: Element,
  ...children: Array<Node | Node[]>
): Element {
  for (const child of children) {
    if (Array.isArray(child)) appendChild(target, ...child)
    else target.appendChild(child)
  }
  return target
}

export function insertBefore(
  target: Element,
  before: Node | Element,
  child: Node | Element
): Element {
  target.insertBefore(before, child)
  return target
}

export function insertAt(
  target: Element,
  child: Node | Element,
  n: number
): Element {
  if (n > target.childNodes.length - 1) {
    appendChild(target, child)
  } else {
    target.insertBefore(child, useChildAt(target, n))
  }
  return target
}

export function replaceAt(
  target: Element,
  child: Node | Element,
  n: number
): Element {
  target.replaceChild(useChildAt(target, n), child)
  return target
}

export function replaceChild(
  target: Element,
  old: Node | Element,
  child: Node | Element
): Element {
  target.replaceChild(old, child)
  return target
}

export function useComment(
  n: Element,
  c?: string | number
): Comment | undefined {
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

export function replaceWith(target: Element | Element, r: Element): Element {
  if (target instanceof Element) {
    target.replaceWith(r)
  } else {
    throw new Error('Target is not a element')
  }

  return r
}

export function useChildAt(target: Element, n: number): ChildNode {
  const o = target.childNodes.item(n)
  if (o == null) {
    throw new Error(`Not found child at ${n}`)
  }

  return o
}

export function useHTML(
  target: Element,
  innerHTML: string,
  check = false
): Element {
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
