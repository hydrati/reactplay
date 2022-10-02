import { Signal, useEffect, useSignal } from './reactive/functional'
import { useDelegate, useEvent, useInsertText, useTemplate } from './web'
import { insertAt, useChildAt } from './web/utils'

const tmpl0 = useTemplate(`<div><button><!0>`, 6)
const tmpl1 = useTemplate(`<p>Count <!0></h1>`, 4)

function HelloWorld(count: Signal<number>) {
  const el = tmpl1()
  useEffect(useInsertText(el, count, 0))
  return el
}

function Count() {
  const count = useSignal(0)
  const handleClick = () => count.set((x) => x + 1)

  const el = insertAt(tmpl0(), HelloWorld(count), 0)
  useEffect(useInsertText(useChildAt(el, 1), count, 0))
  useEvent(el, 'click', handleClick)
  useDelegate(el, 'click')

  return el
}

document.querySelector('#app')?.append(Count())
