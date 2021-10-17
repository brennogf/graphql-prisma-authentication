import { GraphQLServer } from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { PrismaClient } from '.prisma/client'
import { importSchema } from 'graphql-import'
import { resolvers } from '@resolvers/index'
import { Context } from './resolvers/types/context'
import { isAuthenticadedMiddleware } from '@resolvers/middlewares/isAuthenticaded'
import { applyMiddleware } from 'graphql-middleware'
import { loginAndSignUpMiddleware } from './resolvers/middlewares/loginAndSignUp'

export const serverStart = async () => {
  // Importa Typedefs, resolvers e middlewares do GraphQL, cria um schema e aplica
  // Os middlewares
  const typeDefs = importSchema('./src/schema.graphql')
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })
  const schemaWithMiddleware: any = applyMiddleware(
    schema,
    isAuthenticadedMiddleware,
    loginAndSignUpMiddleware
  )

  // Inicia o GraphQL com o schema, prisma e captura o token do usuário
  const prisma = new PrismaClient()
  const server = new GraphQLServer({
    schema: schemaWithMiddleware,
    context: ({ request }): Context => {
      return {
        authorization: request.headers.authorization,
        prisma,
        id: null
      }
    }
  })

  // Configurações pra iniciar o servidor
  const options = {
    port:
      /* istanbul ignore next */
      process.env.NODE_ENV === 'test' ? 0 : process.env.PORT,
    endpoint: '/graphql',
    subscriptions: '/subscriptions',
    playground: '/playground',
    cors: {
      credentials: true,
      origin: [process.env.APP_URL]
    }
  }

  // Corrige erro de não atualizar o Node automaticamente ao salvar
  /* istanbul ignore next */
  process.on('SIGTERM', () => {
    process.exit()
  })

  // Inicia o servidor
  const app = await server.start(options, ({ port }) =>
    console.log(`Server is running on http://localhost:${port}`)
  )

  return app
}
