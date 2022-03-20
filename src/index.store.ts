import { defineStore } from "./reactivity"

export const useStore = defineStore({
  state: () => ({
    name: "Hello",
    age: 20
  }),
  getters: {
    info(state) {
      return `My name is ${state.name}, I'm ${state.age}`
    }
  },
  actions: {
    setAge(n: number) {
      this.age = n
      return n
    },
    setName(n: string) {
      this.name = n
      return n
    }
  }
})