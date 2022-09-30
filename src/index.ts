import { useSignal, useEffect, useScope, useWatch, usePeek } from './reactive'

console.clear()

const count = useSignal<number>(0)

const stop = useScope(() => {
  useEffect((_, stop) =>
    count.value >= 3 ? stop() : console.log('count', count.value)
  )

  useWatch(
    () => usePeek(() => count.value),
    (oldValue, newValue) => console.log(`${oldValue} + 1 = ${newValue}`)
  )
})

count.value += 1 // 1
count.value += 1 // 2
count.value += 1 // 3
count.value += 1 // 4
stop()
count.value += 1 // 5
count.value += 1 // 6
