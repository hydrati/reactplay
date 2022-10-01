/* eslint-disable @typescript-eslint/no-misused-promises */
import { ref, watchEffect } from './reactive/vue'

console.clear()

function useCount() {
  const count = ref(0)

  console.log(count)

  watchEffect(() => console.log(count.value))

  return count
}

const count = useCount()

count.value += 1
count.value += 1
count.value += 1
count.value += 1
