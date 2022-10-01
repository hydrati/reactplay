import { useFnSignal, useEffect } from './reactive'

console.clear()

function useCount() {
  const count = useFnSignal(0)
  console.log(count)
  count()

  useEffect(() => console.log(count()))

  return count
}

const count = useCount()
count.set((x) => x + 1)
