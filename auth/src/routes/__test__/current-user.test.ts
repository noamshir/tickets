import request from 'supertest'
import { app } from '../../app'

it('should responds with details about the current user', async () => {
  const cookie = await global.signin()

  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(res.body.currentUser.email).toEqual('test@test.com')
})

it('should responds with null if not authenticated', async () => {
  const res = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  expect(res.body.currentUser).toBeNull()
})
