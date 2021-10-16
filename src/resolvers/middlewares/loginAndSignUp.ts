// É um middleware que verifica se o usuário está autenticado
const loginAndSignUp = async (resolve, parent, args, context) => {
  return !context.authorization
    ? resolve()
    : new Error('You are already logged in.')
}

// Todos os resolvers que antes terão que passar por esse Middleware
export const loginAndSignUpMiddleware = {
  Mutation: {
    login: loginAndSignUp,
    signup: loginAndSignUp
  }
}
