import { useSignal, effect } from './reactive'

const count = useSignal(0)

effect(() => console.log('new count', count.value), {
  onNotify: console.log,
})

count.value += 1
