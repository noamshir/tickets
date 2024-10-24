import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/ticket'

it('should return a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(404)
})

it('should return a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Title',
      price: 20,
    })
    .expect(401)
})

it('should return a 401 if the user does not own the ticket', async () => {
  const cookie1 = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie1)
    .send({
      title: 'Title',
      price: 20,
    })
  const ticketId = response.body.id

  const cookie2 = global.signin()
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie2)
    .send({
      title: 'New Title',
      price: 20,
    })
    .expect(401)
})

it('should return a 400 if the user provides invalid title or price', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
  const ticketId = response.body.id

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      title: 'Valid Title',
      price: -1,
    })
    .expect(400)
})

it('should return a 400 if the ticket is reserved', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
  const ticketId = response.body.id

  const ticket = await Ticket.findById(ticketId)
  ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  await ticket?.save()

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(400)
})

it('should update the ticket for valid input', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
  const ticketId = response.body.id

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send()

  expect(ticketResponse.body.title).toEqual('New Title')
  expect(ticketResponse.body.price).toEqual(100)
})

it('should publish an event', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Title',
      price: 20,
    })
  const ticketId = response.body.id

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
