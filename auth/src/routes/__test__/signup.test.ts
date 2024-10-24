import request from 'supertest'
import { app } from '../../app'

it('should return a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
})

it('should return a 400 with an invalid email', () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'not-valid',
      password: 'password',
    })
    .expect(400)
})

it('should return a 400 with an invalid password', () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '1',
    })
    .expect(400)
})

it('should return a 400 with missing email and password', () => {
  return request(app).post('/api/users/signup').send({}).expect(400)
})

it('should disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400)
})

it('should sets a cookie after successful signup', async () => {
  const res = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  expect(res.get('Set-Cookie')).toBeDefined()
})
