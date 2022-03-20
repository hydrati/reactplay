import { Effect } from "../store/deps"
import { Props } from "."

export interface Functional<TProps> {
  (ctx: ComponentContext<TProps>): Node
}

export interface ComponentContext<TProps> {
  props: TProps & JSX.HTMLAttributes
  slots: Slots
}

export interface Slots {
  children: () => Node
  [index: string]: () => Node | undefined
}

export interface ComponentFactory<TProps> {
  (props: TProps & JSX.HTMLAttributes): (slots: Slots) => Node
}

export function defineComponent<T = {}>(f: Functional<T>): ComponentFactory<T> {
  return (props) => (slots) => f({props, slots})
}