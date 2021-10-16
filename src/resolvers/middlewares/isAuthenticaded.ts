import jwt from 'jsonwebtoken'

// É um middleware que verifica o token do usuário para validar e identificá-lo
const isAuthenticaded = async (resolve, parent, args, context) => {
  // Identifica se o usuário possui um token no header do navegador
  const authHeader = context.authorization
  if (!authHeader) throw new Error('You are not logged in.')

  // Verifica se o token está bem formatado
  const parts = authHeader.split(' ')
  if (parts.length !== 2) throw new Error('Token error.')

  // Verifica se o token está bem formatado
  const [scheme, token] = parts
  if (!/^Bearer$/i.test(scheme)) throw new Error('Unformatted token.')

  // Verifica se o token é válido e decifra o ID do usuário que estava no token
  // E passa para frente caso decifre o token, senão não passa pelo Middleware
  try {
    const { id }: any = await jwt.verify(token, process.env.TOKEN_SECRET)
    context.id = id
    return resolve()
  } catch (err) {
    throw new Error('Token invalid.')
  }
}

// Todos os resolvers que antes terão que passar por esse Middleware
export const isAuthenticadedMiddleware = {
  Query: {
    users: isAuthenticaded,
    user: isAuthenticaded
  }
}
