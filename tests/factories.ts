import faker from 'faker'
import { User } from '../src/resolvers/types'

type createUser = {
  id?: string
  username?: string
  email?: string
  password?: string
}

class Factory {
  createUser({
    username = faker.internet.userName(),
    email = faker.internet.email(),
    password = faker.internet.password()
  }: createUser) {
    const user: User = {
      id: null,
      username,
      email,
      password
    }
    return user
  }
}

export default new Factory()
