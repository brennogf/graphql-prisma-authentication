import { PrismaClient } from '.prisma/client'
import { gql, GraphQLClient, request } from 'graphql-request'
import { serverStart } from '../../src/server'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
let getHost

describe('Query', () => {
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

  it('Pesquisando todos os usuários', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'teste7',
        email: 'teste7@teste.com',
        password: 'Teste123@'
      }
    })

    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        users {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    await client.request(query).then(data => {
      expect(data.users[0].username).toBe('teste7')
    })
  })

  it('Pesquisando sem token', async () => {
    const query = gql`
      query {
        users {
          username
        }
      }
    `
    await request(getHost, query).catch(err => {
      expect(err.response.errors[0].message).toBe('You are not logged in.')
    })
  })

  it('Pesquisando um usuário específico', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'teste6',
        email: 'teste6@teste.com',
        password: 'Teste123@'
      }
    })

    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        user(id: "${user.id}") {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    await client.request(query).then(data => {
      expect(data.user.username).toBe('teste6')
    })
  })

  it('Pesquisando um usuário que não existe', async () => {
    const token = jwt.sign({ id: 'test' }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        user(id: "test") {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    await client.request(query).then(data => {
      expect(data.user).toBe(null)
    })
  })

  it('Pesquisando com token mal formatado', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'teste8',
        email: 'teste8@teste.com',
        password: 'Teste123@'
      }
    })

    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        user(id: "${user.id}") {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer' + token
      }
    })

    await client.request(query).catch(err => {
      expect(err.response.errors[0].message).toBe('Token error.')
    })
  })

  it('Pesquisando com token mal formatado 2', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'teste9',
        email: 'teste9@teste.com',
        password: 'Teste123@'
      }
    })

    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        user(id: "${user.id}") {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Beare ' + token
      }
    })

    await client.request(query).catch(err => {
      expect(err.response.errors[0].message).toBe('Unformatted token.')
    })
  })

  it('Pesquisando com token inválido', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'teste10',
        email: 'teste10@teste.com',
        password: 'Teste123@'
      }
    })

    const token = jwt.sign({ id: user.id }, 'teste', {
      expiresIn: '1 day'
    })

    const query = gql`
      query {
        user(id: "${user.id}") {
          username
        }
      }
    `

    const client = new GraphQLClient(getHost, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    await client.request(query).catch(err => {
      expect(err.response.errors[0].message).toBe('Token invalid.')
    })
  })
})
