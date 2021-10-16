import { MutationResolvers, User } from '@resolvers/types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// É importado somente os mutation resolvers do "resolvers/types/index.ts"
// Gerados automaticamente que faz funcionar o intelligence do GraphQL com o
// context(prisma e token), args e parent ao definir o tipo do MutationResolvers

export const Mutation: MutationResolvers = {
  // Cadastra/Registra usuário
  signup: async (parent, args, context) => {
    // Verifica se o email é válido
    args.email.trim()
    const regexEmail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!regexEmail.test(args.email)) throw new Error('Invalid email.')

    // Verifica se o username é válido
    args.username.trim()
    if (args.username.indexOf(' ') >= 0) {
      throw new Error('Username contains empty spaces.')
    }
    if (args.username.length < 5) throw new Error('Username too short.')
    if (args.username.length > 16) throw new Error('Username too long.')
    const regexUsername = /\W|_/
    if (regexUsername.test(args.username)) {
      throw new Error('Username contains special characters.')
    }

    // Verifica se o email já está cadastrado
    const searchEmail = await context.prisma.user.findUnique({
      where: { email: args.email }
    })
    if (searchEmail) throw new Error('Email already exists.')

    // Verifica se o username já foi cadastrado
    const searchUsername = await context.prisma.user.findUnique({
      where: { username: args.username }
    })
    if (searchUsername) throw new Error('Username already exists.')

    // Verifica se a senha é forte
    // (?=(?:.*?[A-Z]){1}) - Mínimo 1 letra maiúscula
    // (?=(?:.*?[0-9]){1}) - Mínimo 1 número
    // (?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#;$%*(){}_+^&] - Mínimo 1 caractere especial
    const regexPassword =
      /^(?=(?:.*?[A-Z]){1})(?=(?:.*?[0-9]){1})(?=(?:.*?[!@#$%*()_+^&}{:;?.]){1})(?!.*\s)[0-9a-zA-Z!@#$%;*(){}_+^&]*$/
    if (args.password.length < 8 || !regexPassword.exec(args.password)) {
      throw new Error('Weak password.')
    }

    // Cifra a senha e cria o novo usuário
    const password = await bcrypt.hash(args.password, 10)
    const user: User = await context.prisma.user.create({
      data: {
        ...args,
        password
      }
    })

    // Cria o token do usuário
    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    // Não deixar repassar o ID e password cifrada do banco de dados
    user.id = ''
    user.password = ''

    return {
      user,
      token
    }
  },

  // Faz a autenticação do usuário
  login: async (parent, args, context) => {
    // Verifica se o email existe
    const user: User = await context.prisma.user.findUnique({
      where: { email: args.email }
    })
    if (!user) throw new Error('Email not found.')

    // Verifica se a senha está correta
    const isValid = await bcrypt.compare(args.password, user.password)
    if (!isValid) throw new Error('Incorrect password.')

    // Cria o token do usuário
    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    // Não deixar repassar o ID e password cifrada do banco de dados
    user.id = ''
    user.password = ''

    return {
      user,
      token
    }
  }
}
