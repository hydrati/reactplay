import { useSignal, useValue, useEffect, useGetter, useMemo } from './reactive'

console.clear()

function useCount(): () => void {
  const [count, setCount] = useValue(useSignal(0))

  const [output] = useGetter(useMemo(() => `Count: ${count()}`))

  useEffect(() => console.log(output())) // 0

  return () => setCount((x) => x + 1)
}

const count = useCount()

count() // 1
count() // 2
count() // 3
