# reactivity
Reactivity like Vue 3.x

```typescript
import { useSignal, useValue, useEffect } from './reactive'

console.clear()

function useCount(): () => void {
  const [count, setCount] = useValue(useSignal(0))

  useEffect(() => console.log(count())) // 0

  return () => setCount((x) => x + 1)
}

const count = useCount()

count() // 1
count() // 2
```