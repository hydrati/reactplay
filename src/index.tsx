import {
  defineComponent,
  reactive,
  mount,
  watch
} from './reactivity'

const App = defineComponent(() => {
  const info = reactive<{
    name: string,
    age: number
  }>({
    name: "John",
    age: 20
  })

  watch([() => info.name, () => info.age], (old, newVal) => {
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