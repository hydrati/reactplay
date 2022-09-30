import { useSignal, useEffect } from './reactive'

const count = useSignal(0)

const stop = useEffect(() => {
  console.log('new count', count.value)
  if (count.value >= 3) {
    console.log('stop!')
    stop()
  }
})

count.value += 1
count.value += 1
count.value += 1
count.value += 1
