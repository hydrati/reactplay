import { Route } from './index.router'
import {
  defineComponent,
  reactive,
  mount,
  watch,
  ref,
} from './reactivity'

export default defineComponent(() => {
  return <>
    <h1>Second Page</h1>
    <button onClick={() => Route.to('/')}>Back Home</button>
  </>
})