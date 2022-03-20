import {
  defineComponent,
} from '../reactivity'

import { Route } from '../index.router'
import { NameInput } from '../components/NameInput'
import { Count } from '../components/Count'


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

