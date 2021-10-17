import { PrismaClient } from '.prisma/client'
import { request, GraphQLClient, gql } from 'graphql-request'
import { serverStart } from '../../src/server'
import factory from '../factories'

const prisma = new PrismaClient()
let getHost, token

describe('Signup', () => {
  // Inicia o servidor antes de começar os testes
  beforeAll(async () => {
    const app = await serverStart()
    const { port }: any = app.address()
    getHost = `http://127.0.0.1:${port}/graphql`
  })

  beforeEach(async () => {
    await prisma.user.deleteMany({})
  })

  // Exclui todos os dados depois de cada teste
  afterEach(async () => {
    await prisma.user.deleteMany({})
  })

  it('Cadastrando usuário', async () => {
    const user = factory.createUser({
      username: 'teste3',
      password: 'Teste123@'
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

  it('Cadastrando usuário que já está logado', async () => {
    const user = factory.createUser({
      username: 'teste',
      password: 'Teste123@'
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

  it('Cadastrando usuário com email inválido', async () => {
    const user = factory.createUser({
      username: 'teste',
      email: 'teste.com',
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Invalid email.')
    })
  })

  it('Cadastrando usuário com username contendo espaços vazios', async () => {
    const user = factory.createUser({
      username: 'teste teste',
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe(
        'Username contains empty spaces.'
      )
    })
  })

  it('Cadastrando usuário com username curto', async () => {
    const user = factory.createUser({
      username: 'test',
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Username too short.')
    })
  })

  it('Cadastrando usuário com username longo', async () => {
    const user = factory.createUser({
      username: 'testetestetestetestetesteteste',
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Username too long.')
    })
  })

  it('Cadastrando usuário com username contendo caracteres especiais', async () => {
    const user = factory.createUser({
      username: 'teste@',
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe(
        'Username contains special characters.'
      )
    })
  })

  it('Cadastrando usuário com email que já existe', async () => {
    const userPrisma = await prisma.user.create({
      data: {
        username: 'teste4',
        email: 'teste4@teste.com',
        password: 'Teste123@'
      }
    })

    const user = factory.createUser({
      username: 'teste',
      email: userPrisma.email,
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Email already exists.')
    })
  })

  it('Cadastrando usuário com username que já existe', async () => {
    const userPrisma = await prisma.user.create({
      data: {
        username: 'teste',
        email: 'teste@teste.com',
        password: 'Teste123@'
      }
    })

    const user = factory.createUser({
      username: userPrisma.username,
      password: 'Teste123@'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Username already exists.')
    })
  })

  it('Cadastrando usuário com senha fraca', async () => {
    const user = factory.createUser({
      username: 'teste',
      password: 'teste'
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

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Weak password.')
    })
  })
})
