import { Route } from '../index.router'
import {
  defineComponent,
} from '../reactivity'

export default defineComponent(() => {
  return <>
    <h1>Second Page</h1>
    <button onClick={() => Route.to('/')}>Back Home</button>
  </>
})