import { QueryResolvers } from '@resolvers/types'

// É importado somente os query resolvers do "resolvers/types/index.ts"
// Gerados automaticamente que faz funcionar o intelligence do GraphQL com o
// context(prisma e token), args e parent ao definir o tipo do QueryResolvers

export const Query: QueryResolvers = {
  // Envia dados de todos os usuários para qualquer usuário
  users: async (parent, args, context) => {
    const user = await context.prisma.user.findMany()

    // Não deixar repassar o ID e password cifrada do banco de dados
    for (let i = 0; i < user.length; i++) {
      user[i].id = ''
      user[i].password = ''
    }

    return user
  },

  // Envia dados de um usuário específico somente para usuários logados
  user: async (parent, args, context) => {
    const user = await context.prisma.user.findUnique({
      where: {
        id: args.id
      }
    })

    // Não deixar repassar o ID e password cifrada do banco de dados
    if (user) {
      user.id = ''
      user.password = ''
      return user
    } else return user
  }
}
