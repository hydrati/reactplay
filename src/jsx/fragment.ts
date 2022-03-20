import { Child, createNativeElement } from "."

export class VFragment extends HTMLElement {
  constructor() {
    super()
  }
}

customElements.define('v-fragment-container', VFragment)

export function createFragment(children: Child[]) {
  return createNativeElement('v-fragment-container', {}, children)
}