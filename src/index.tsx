import {
  ref,
  defineComponent,
  mount
} from './reactivity'
import { computed, reactive } from './stores'

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
      <p>Hi, My name is {() => info.name}. I'm {() => info.age} years old.</p>
      <p>Name: <input 
          oninput={handleInputName}
          value={info.name}
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