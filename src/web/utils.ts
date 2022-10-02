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
  target: Node,
  ...children: Array<Node | Node[]>
): Node {
  for (const child of children) {
    if (Array.isArray(child)) appendChild(target, ...child)
    else target.appendChild(child)
  }
  return target
}

export function insertBefore(target: Node, before: Node, child: Node): Node {
  target.insertBefore(before, child)
  return target
}

export function insertAt(target: Node, child: Node, n: number): Node {
  if (n > target.childNodes.length - 1) {
    appendChild(target, child)
  } else {
    target.insertBefore(child, useChildAt(target, n))
  }
  return target
}

export function replaceAt(target: Node, child: Node, n: number): Node {
  target.replaceChild(useChildAt(target, n), child)
  return target
}

export function replaceChild(target: Node, old: Node, child: Node): Node {
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

export function replaceWith(target: Node | Element, r: Node): Node {
  if (target instanceof Element) {
    target.replaceWith(r)
  } else {
    throw new Error('Target is not a element')
  }

  return r
}

export function useChildAt(target: Node, n: number): Node {
  const o = target.childNodes.item(n)
  if (o == null) {
    throw new Error(`Not found child at ${n}`)
  }

  return o
}

export function useHTML(target: Node, innerHTML: string): Node {
  if (target instanceof Element) {
    target.innerHTML = innerHTML
    return target
  } else {
    throw new Error('Target is not a element')
  }
}
