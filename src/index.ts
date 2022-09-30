import { useSignal, useValue, useEffect, setValue } from './reactive'

console.clear()

const count = useSignal(0)

useEffect(() => console.log(useValue(count)))

setValue(count, () => 1)
