import { Child, createFragment, createNativeElement, patchChildren } from "../jsx";
import { RefImpl } from "../store/ref";


export class RouterFragment extends HTMLElement {
  #lock = false
  #fragment: ShadowRoot = this.attachShadow({
    mode: 'open'
  })

  #cached = new Map<string, Child[]>()

  #clean() {
    this.#fragment.replaceChildren()
    /// console.log('clean', this.#fragment)
  }

  #patch(n: Child[]) {
    patchChildren(this.#fragment, n)
  }

  cache(name: string, f: Child[]) {
    if (!this.#cached.has(name)) {
      this.#cached.set(name, f)
    }
  }

  has(name: string) {
    return this.#cached.has(name)
  }

  replace(name: string) {
    if (this.#lock) return;
    this.#lock = true
    this.#clean()
    this.#patch(this.#cached.get(name) ?? [])
    this.#lock = false
  }

  get lock() {
    return this.#lock
  }
}


customElements.define('v-route-view-container', RouterFragment);

export function createViewContainer(): RouterFragment {
  return document.createElement('v-route-view-container') as any
}