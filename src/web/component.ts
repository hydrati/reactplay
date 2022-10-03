import { Fragment, h, useFragment, VElement } from './utils'
import { onScopeDipose, useScope } from '../reactive'
import { setStopFn } from '../reactive/utils'

export { onScopeDipose as onUnmount }

export type Props = Record<string, unknown>
export type Functional<T extends Props | undefined | null = undefined> = (
  props: T
) => VElement

export function useComponent<T extends Props | undefined | null = undefined>(
  functional: Functional<T>,
  props: T
): Fragment {
  let el!: Fragment
  const stop = useScope(() => (el = useFragment(functional(props))))
  setStopFn(el, stop)
  return el
}

export function functional<T extends Props | undefined | null = undefined>(
  functional: Functional<T>
): Functional<T> {
  return functional
}
