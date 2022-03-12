# reactivity
Reactivity like Vue 3.x

## Features
- Dependency-Collect Reactivity
- `Reactive` Object based on ES6 `Proxy`
- `Ref` and `Computed` Objects
- Functional Component
- Partly Composition API
- Output Native DOM Node

## Examples
### Count Times
```tsx
import {
  ref,
  defineComponent,
  mount
} from './reactivity'

const App = defineComponent(() => {
  const count = ref(0)
  const handleClick = () => count.value += 1

  return (
    <>
      <p>Click times: {count}</p>
      <button onclick={handleClick}>Click me! {count}</button>
    </>
  )
})

mount('#app', App)
```

### Name and age
```tsx
import {
  defineComponent,
  reactive,
  mount
} from './reactivity'

const App = defineComponent(() => {
  const info = reactive<{
    name: string,
    age: number
  }>({
    name: "John",
    age: 20
  })

  const handleInputName = (ev: InputEvent) => {
    info.name = (ev.target as HTMLInputElement)?.value ?? ""
  }

  const handleInputAge = (ev: InputEvent) => {
    info.age = parseInt((ev.target as HTMLInputElement)?.value ?? "")
  }

  return (
    <>
      <p>Hi, My name is {() => info.name /* Make it reactive */}. I'm {() => info.age} years old.</p>
      <p>Name: <input 
          oninput={handleInputName}
          value={info.name /* This is not reactive */}
        />
      </p>
      <p>Age: <input 
          oninput={handleInputAge} 
          value={info.age}
        />
      </p>
    </>
  )
})

mount('#app', App)
```