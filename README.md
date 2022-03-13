# reactivity
Reactivity like Vue 3.x

## Features
- Typescript JSX Support
- Components and Fragment
- Dependency-Collect Reactivity
- `Reactive` Object based on ES6 `Proxy`
- `Ref` and `Computed` Objects
- Functional Component
- Partly Composition API
- Output Native DOM Node

## Examples
```tsx
import {
  defineComponent,
  reactive,
  mount,
  watch,
  ref,
} from './reactivity'

const NameInput = defineComponent(() => {
  
  const info = reactive<{
    name: string,
    age: number
  }>({
    name: "John",
    age: 20
  })

  watch([
    () => info.name,
    () => info.age
  ], (old, newVal) => {
    console.log(old, newVal, "watch")
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
          onInput={handleInputName}
          value={info.name /* This is not reactive */}
        />
      </p>
      <p>Age: <input 
          onInput={handleInputAge} 
          value={info.age}
        />
      </p>
    </>
  )
})

const Count = defineComponent(() => {
  const count = ref(0)
  const handleClick = () => count.value += 1

  return (
    <>
      <p>Click times: {count}</p>
      <button onClick={handleClick}>Click me! {count}</button>
    </>
  )
})

const Text = defineComponent<{
  name: string
}>((ctx) => (<h1>{ctx.props.name}</h1>))

const App = defineComponent(() => (
  <>
    <Text name="hello" />
    <Count />
    <NameInput />
  </>
))

mount('#app', <App />)
```

## License
MIT License, Copyright (c) Hydrogen