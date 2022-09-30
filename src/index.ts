import { useSignal, useValue, useEffect } from './reactive'

console.clear()

const [count, setCount] = useValue(useSignal(0))

useEffect(() => console.log(count()))

setCount((x) => x + 1)
