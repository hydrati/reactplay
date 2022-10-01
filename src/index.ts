import { useFnMemo, useEffect, useFnSignal } from './reactive'
import * as r from './reactive'
;(globalThis as any)._ = r

const add = useFnSignal(0)
const count = useFnMemo((old) => add.value + 1, 0)
console.log(count)
useEffect(() => console.log(count()))

add.set((x) => x + 1)
add.set((x) => x + 1)
add.set((x) => x + 1)
