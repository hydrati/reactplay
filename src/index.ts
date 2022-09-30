import {
  useMemo,
  effect,
  useReactive,
  toRefs,
  useRefs,
  useDetachedScope,
} from './reactive'

const count = useReactive([0, 1, 2, 3])
console.log(count)

const stop = useDetachedScope(() => {
  const plusOne = useMemo(() => count.length + 1)

  const l = effect(() => console.log('length', count.length))

  effect(() => console.log('count', count[2]))
  effect(() => console.log('plusOne', plusOne.value))
  console.log(count, plusOne, l)
})

console.group('op 1')

count.push(4)

console.groupEnd()

console.group('op 2')

effect(() => console.log('op2', count.includes(4)))

console.groupEnd()

console.log(useRefs(toRefs(count)))

console.group('op 3')

stop()
count.length = 0

console.groupEnd()
