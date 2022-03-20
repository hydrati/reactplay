import { ComponentFactory, createComponent, defineComponent } from "../jsx";
import { createViewContainer, RouterFragment } from "./view";

type PageComponent = Node | ComponentFactory<{}>
type Page = PageComponent | (() => Promise<PageComponent>) | Promise<PageComponent>

export interface RouteItem {
  path: string,
  redirect?: string,
  component?: Page
}

async function resolveComponent(r: Page): Promise<PageComponent> {
  if (typeof r === 'function') {
    const f = (r as any)()
    if ((f as any).then != undefined && typeof (f as any).then === 'function') {
      return await (f as any)
    }
  } else if ((r as any).then != undefined && typeof (r as any).then === 'function') {
    return await (r as any)
  }

  return r as any
}

export interface RouteInit {
  onnotfound?: ((to: (path: string) => void) => void | Promise<void>) | null,
  defaults?: string
}

export class Router {
  #fragment = createViewContainer()
  #components = new WeakMap<Page, PageComponent>()
  #pages: RouteItem[]

  onnotfound: ((to: (path: string) => void) => void | Promise<void>) | null | undefined = null

  constructor(pages: RouteItem[] = [], init: RouteInit = {}) {
    this.onnotfound = init.onnotfound
    this.#pages = pages
    this.useHook()
    this.to(init.defaults ?? '/')
  }

  async #resolvePage(page: Page): Promise<PageComponent> {
    const p = this.#components.get(page)
    if (p != undefined) return p
    
    const f = await resolveComponent(page)
    this.#components.set(page, f)
    return f
  }

  async #redirect(path: string): Promise<boolean> {
    if (this.#fragment.lock) return true
    const item = this.#pages.find(v => v.path === path)
    if (typeof item?.redirect === 'string') {
      return this.#redirect(item.redirect)
    } else if (item?.component != undefined) {
      if (!this.#fragment.has(path)) {
        const page = await this.#resolvePage(item.component)
        if (page instanceof Node) {
          this.#fragment.cache(path, [page])
        } else {
          this.#fragment.cache(path, [createComponent(page, {}, [])])
        }
      }

      this.#fragment.replace(path)

      return true
    }

    return false
  }

  async to(path: string) {
    await this.#changeHash(path)
    await this.refresh()
  }

  async refresh() {
    if (!await this.#redirect(location.hash.slice(1))) {
      this.onnotfound?.(this.to.bind(this))
      
    }
  }

  async #changeHash(path: string) {
    if ('#' + path === location.hash) return
    location.hash = '#' + path
  }

  useHook() {
    window.addEventListener('hashchange', async (ev) => {
      await this.refresh()
    })
  }

  #view = defineComponent(() => this.#fragment)
  get View() {
    return this.#view
  }
}

export { RouterFragment }