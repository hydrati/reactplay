const activeEvent = new WeakMap<any, Set<string>>()
const handlers = new WeakMap<any, Map<string, (...args: any[]) => any>>()

export function useDelegate(n: Element, ...events: string[]): () => void {
  const handler = handlers.get(n)
  if (handler == null) {
    return () => {}
  }

  let active = activeEvent.get(n)
  if (active == null) {
    active = new Set()
    activeEvent.set(n, active)
  }

  for (let i = 0; i < events.length; i += 1) {
    if (!active.has(events[i])) {
      const f = handler.get(events[i])
      if (f != null) {
        n.addEventListener(events[i], f)
        active.add(events[i])
      }
    }
  }

  return () => disposeDelegate(n, ...events)
}

export function disposeDelegate(n: Element, ...events: string[]) {
  const active = activeEvent.get(n)
  if (active == null) return
  const handler = handlers.get(n)
  if (handler == null) return
  for (let i = 0; i < events.length; i += 1) {
    if (active.has(events[i])) active.delete(events[i])
    const f = handler.get(events[i])
    if (f != null) n.removeEventListener(events[i], f)
  }
}

export function disposeDelegateAll(n: Element) {
  const active = activeEvent.get(n)
  if (active == null) return
  const handler = handlers.get(n)
  if (handler == null) return
  for (const ev of active) {
    active.delete(ev)
    const h = handler.get(ev)
    if (h != null) n.removeEventListener(ev, h)
  }
}

export function useEvent(n: Element, event: string, f?: (...args: any) => any) {
  let handler = handlers.get(n)
  if (f != null && handler == null) {
    handler = new Map()
    handlers.set(n, handler)
  }

  if (handler != null) {
    if (f == null) handler.delete(event)
    else handler?.set(event, f)
  }
}
