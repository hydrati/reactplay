import { useEffect, useReactive } from './reactive'

interface User {
  name: string
  password: string
}

const users = useReactive([] as User[])

useEffect(() => {
  console.group('user effect')
  for (const user of users) {
    console.log(user)
  }
  console.groupEnd()
})

users.push({ name: 'Tom', password: '114514' })
console.log(users)
