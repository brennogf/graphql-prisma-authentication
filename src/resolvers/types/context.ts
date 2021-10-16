import { PrismaClient } from '@prisma/client'

// Faz parte do processo para fazer funcionar o intelligence do GraphQL com
// Prisma e token nos resolvers, logo em seguida é o "yarn graphql-codegen"
// Para gerar automaticamente os tipos na pasta "types"

// O codegen também cria os tipos criados automaticamente pelo prisma na pasta
// '@prisma/client/index.d', faz funcionar o parent do GraphQL
export type Context = {
  authorization: String
  prisma: PrismaClient
  id: string
}
