import {
  defineComponent,
} from '../reactivity'

import { useStore } from '../index.store'

export const NameInput = defineComponent(() => {
  const store = useStore()

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
