import { Effect } from "../stores/deps"
import { Props } from "."

export interface Functional<TProps> {
  (ctx: ComponentContext<TProps>): Node
}

export interface ComponentContext<TProps> {
  props: TProps
  slots: Slots
}

export interface Slots {
  children: () => Node
  [index: string]: () => Node | undefined
}

export interface ComponentFactory<TProps> {
  (props: TProps): (slots: Slots) => Node
}

export function defineComponent<T = {}>(f: Functional<T>): ComponentFactory<T> {
  return (props) => (slots) => f({props, slots})
}