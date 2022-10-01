import { ref, watchEffect, effectScope, Ref } from './reactive/vue'

console.clear()

function useCount(): readonly [Ref<number>, () => void] {
  const count = ref(0)

  console.log(count)

  const scope = effectScope()

  watchEffect(() => console.log('a', count.value))

  scope.run(() => {
    watchEffect(() => console.log('b', count.value))
    watchEffect(() => console.log('c', count.value))
    watchEffect(() => console.log('d', count.value))
  })

  return [count, () => scope.stop()]
}

const [count, stop] = useCount()

console.group('before')
count.value += 1
stop()
console.groupEnd()

console.group('after')
count.value += 1
count.value += 1
count.value += 1
console.groupEnd()
