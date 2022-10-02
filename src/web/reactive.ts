import { useComment, valToString } from './utils'

export function useInsertText<T>(
  n: Element,
  v: () => T,
  c?: string | number
): () => void {
  const o = useComment(n, c)

  if (o == null) {
    return () => {}
  }

  const t = document.createTextNode('')
  o.replaceWith(t)

  return () => {
    t.textContent = valToString(v())
  }
}

export function useInsertAttr<T>(
  n: Element,
  k: string,
  v: () => T
): () => void {
  return () => {
    const e = n
    if (typeof e.setAttribute === 'function') {
      e.setAttribute(k, valToString(v()))
    } else {
      ;(e as any)[k] = valToString(v())
    }
  }
}

export function useInsertAttrNS<T>(
  n: Element,
  ns: string,
  k: string,
  v: () => T
): () => void {
  return () => {
    const e = n
    if (typeof e.setAttribute === 'function') {
      e.setAttributeNS(k, ns, valToString(v()))
    }
  }
}
