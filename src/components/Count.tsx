import {
  defineComponent,
  ref,
} from '../reactivity'

export const Count = defineComponent(
  () => {
    const count = ref(0)
    const handleClick = () => count.value += 1

    return (
      <>
        <p>Click times: {count}</p>
        <button onClick={handleClick}>Click me! {count}</button>
      </>
    )
  }
)