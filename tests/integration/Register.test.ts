import { PrismaClient } from '.prisma/client'
import { request, GraphQLClient, gql } from 'graphql-request'
import { serverStart } from '../../src/server'
import factory from '../factories'

const getHost = 'http://localhost:3333/graphql'
let token

describe('Register', () => {
  // Inicia o servidor antes de começar os testes
  beforeAll(async () => {
    await serverStart()
  })

  // Exclui todos os dados depois de cada teste
  afterEach(async () => {
    const prisma = new PrismaClient()
    await prisma.user.deleteMany({})
  })

  // Primeiro teste
  it('Cadastrando usuário que não está logado', async () => {
    const user = factory.createUser({
      username: 'brenno',
      password: 'Breno1996@'
    })

    const mutation = gql`
    mutation {
      signup(username: "${user.username}" email: "${user.email}" password: "${user.password}"){
        token
        user{
          username
        }
      }
    }`

    await request(getHost, mutation).then(data => {
      token = data.token
      expect(data.signup.user.username).toBe(user.username)
    })
  })

  // Segundo teste
  it('Cadastrando usuário que já está logado', async () => {
    const user = factory.createUser({
      username: 'brenno',
      password: 'Breno1996@'
    })

    const mutation = gql`
    mutation {
      signup(username: "${user.username}" email: "${user.email}" password: "${user.password}"){
        token
        user{
          username
        }
      }
    }`

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    await client.request(mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('You are already logged in.')
    })
  })
})
