import { useSignal, useEffect } from './reactive'

const count = useSignal(0)

useEffect(() => console.log(count.value))

count.value += 1
count.value += 1
