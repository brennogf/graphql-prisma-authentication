import { Resolvers } from './types'
import { Query } from '@resolvers/Query'
import { Mutation } from '@resolvers/Mutation'

// Junta todos os resolvers pra iniciar o GraphQL
export const resolvers: Resolvers = {
  Query,
  Mutation
}
