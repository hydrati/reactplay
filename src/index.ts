import { useEffect, useSignal } from './reactive/functional'
import { useDelegate, useEvent, useInsertText, useTemplate } from './web'
import { insertAt, useChildAt } from './web/utils'

const tmpl0 = useTemplate(`<div><button><!0>`, 6)
const tmpl1 = useTemplate(`<h1>Hello, world</h1>`, 3)

function HelloWorld() {
  return tmpl1()
}

function Count() {
  const count = useSignal(0)
  const handleClick = () => count.set((x) => x + 1)

  const element = insertAt(tmpl0(), HelloWorld(), 0)

  useEffect(useInsertText(useChildAt(element, 1), count, 0))

  useEvent(element, 'click', handleClick)
  useDelegate(element, 'click')

  return element
}

document.querySelector('#app')?.append(Count())
