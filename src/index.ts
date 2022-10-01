import { useMemo, useEffect, useSignal } from './reactive'

const add = useSignal(0)
const count = useMemo((old) => add.value + 1, 0)

useEffect(() => console.log(count.value))

add.value += 1
add.value += 1
add.value += 1
add.value += 1
