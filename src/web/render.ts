import { useScope } from '../reactive'
import { useTemplate } from './template'

export type RenderFn = () => Node
export type StopFn = () => void

export function runRender(h: RenderFn): [Node, StopFn] {
  let n: Node
  const s = useScope(() => (n = h()))
  return [n!, s]
}

export type Props = Record<string, any> | undefined
export type Component<T extends Props> = (props: T) => () => Node
export type Component0 = () => () => Node

export interface DefineComponent<T extends Props = undefined> {
  template: string
  setup: (props?: T) => (root: Node) => Node
}

export function defineComponent(comp: DefineComponent): Component0
export function defineComponent<T extends Props>(
  comp: DefineComponent<T>
): Component<T>
export function defineComponent<T extends Props>(
  comp: DefineComponent<T>
): Component<T> | Component0 {
  const tmpl = useTemplate(comp.template)
  return (props) => {
    const render = comp.setup(props)
    return () => render(tmpl())
  }
}
