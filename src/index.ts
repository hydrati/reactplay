import { useEffect } from './reactive'
import { useSignal } from './reactive/functional'

console.clear()

function useCount() {
  const count = useSignal(0)
  console.log(count)
  count()

  useEffect(() => console.log(count()))

  return count
}

const count = useCount()
count.set((x) => x + 1)
