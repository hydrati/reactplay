import { useEffect, useSignal } from './reactive/functional'
import { useDelegate, useEvent, useInsertText, defineComponent } from './web'

export default defineComponent({
  template: `<button><!0>`,
  setup() {
    const count = useSignal(0)
    const handleClick = () => count.set((x) => x + 1)

    return (el) => {
      useEffect(useInsertText(el, count))

      useEvent(el, 'click', handleClick)
      useDelegate(el, 'click')

      return el
    }
  },
})
