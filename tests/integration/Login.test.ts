import { PrismaClient } from '.prisma/client'
import { request, gql } from 'graphql-request'
import { serverStart } from '../../src/server'
import factory from '../factories'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
let getHost

describe('Login', () => {
  // Inicia o servidor antes de começar os testes
  beforeAll(async () => {
    const app = await serverStart()
    const { port }: any = app.address()
    getHost = `http://127.0.0.1:${port}/graphql`
  })

  // Exclui todos os dados depois de cada teste
  afterEach(async () => {
    await prisma.user.deleteMany({})
  })

  it('Usuário logando', async () => {
    const userPrisma = await prisma.user.create({
      data: {
        username: 'teste5',
        email: 'teste5@teste.com',
        password: await bcrypt.hash('Teste123@', 10)
      }
    })

    const user = factory.createUser({
      email: userPrisma.email,
      password: 'Teste123@'
    })

    const mutation = gql`
    mutation {
      login(email: "${user.email}" password: "${user.password}"){
        token
        user{
          email
        }
      }
    }`

    await request(getHost, mutation).then(data => {
      expect(data.login.user.email).toBe(user.email)
    })
  })

  it('Usuário logando com email não cadastrado', async () => {
    const user = factory.createUser({
      username: 'teste',
      email: 'teste2@teste.com',
      password: 'Teste123@'
    })

    const mutation = gql`
    mutation {
      login(email: "${user.email}" password: "${user.password}"){
        token
        user{
          username
        }
      }
    }`

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Email not found.')
    })
  })

  it('Usuário logando com senha incorreta', async () => {
    const userPrisma = await prisma.user.create({
      data: {
        username: 'teste',
        email: 'teste@teste.com',
        password: await bcrypt.hash('Teste123@', 10)
      }
    })

    const user = factory.createUser({
      email: userPrisma.email,
      password: 'Teste123'
    })

    const mutation = gql`
    mutation {
      login(email: "${user.email}" password: "${user.password}"){
        token
        user{
          username
        }
      }
    }`

    await request(getHost, mutation).catch(err => {
      expect(err.response.errors[0].message).toBe('Incorrect password.')
    })
  })
})
