import { Effect } from "../stores/deps"
import { Props } from "."

export interface Functional<TProps = {}> {
  (ctx: ComponentContext<TProps>): Node
}

export interface ComponentContext<TProps = {}> {
  children: () => Node
  props: Props<TProps>
}

export function defineComponent<T = {}>(f: Functional<T>) {
  return f
}