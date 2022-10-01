import { useFnSignal, useEffect } from './reactive'

const count = useFnSignal(0)

useEffect(() => console.log(count(), count.value, count.get()))

count.set(1)
count.set((x) => x + 1)
