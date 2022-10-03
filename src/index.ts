import { useEffect, useSignal, useStop } from './reactive/functional'
import {
  useDelegate,
  useEvent,
  useInsertText,
  useStyle,
  useTemplate,
  functional,
  useComponent,
  onUnmount,
} from './web'

const tmpl0 = useTemplate(`<button><!0>`, 4)

const Count = functional<{}>(() => {
  const el = tmpl0()

  const count = useSignal(0)
  const add = () => count.set((x) => x + 1)

  useEffect(useInsertText(el, count, 0))
  useEvent(el, 'click', add)
  useDelegate(el, 'click')

  useEffect(
    useStyle(el, () => ({
      color: count() % 2 === 0 ? 'black' : 'green',
    }))
  )

  onUnmount(() => console.log('stopped.'))

  return el
})

const [count, stop] = useStop(useComponent(Count, {}))

document.getElementById('app')!.append(count)

stop()
