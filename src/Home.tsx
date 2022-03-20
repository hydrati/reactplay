import {
  defineComponent,
  reactive,
  mount,
  watch,
  ref,
} from './reactivity'

import { useStore } from './index.store'
import { Route } from './index.router'

const NameInput = defineComponent(() => {
  const store = useStore()
  // console.log(store)
  const handleInputName = (ev: InputEvent) => {
    store.setName((ev.target as HTMLInputElement)?.value ?? "")
  }

  const handleInputAge = (ev: InputEvent) => {
    store.setAge(parseInt((ev.target as HTMLInputElement)?.value ?? ""))
  }

  return (
    <>
      <p>{() => store.info}</p>
      <p>Name: <input 
          onInput={handleInputName}
          value={store.name /* This is not reactive */}
        />
      </p>
      <p>Age: <input 
          onInput={handleInputAge} 
          value={store.age}
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

export const Home = defineComponent(() => (
  <>
    <Text name="hello" />
    <Count />
    <NameInput />
    <button onClick={() => Route.to('/second')}>Second Page</button>
  </>
))

