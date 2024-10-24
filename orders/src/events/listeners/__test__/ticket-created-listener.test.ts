import mongoose from 'mongoose'
import { TicketCreatedEvent } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'New Title',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create fake message obj
  const message = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, data, message }
}

it('should create and save a ticket', async () => {
  const { listener, data, message } = await setup()

  // call the onMessage fn with data obj + message obj
  await listener.onMessage(data, message)

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket?.title).toEqual(data.title)
  expect(ticket?.price).toEqual(data.price)
})

it('should ack the message', async () => {
  const { listener, data, message } = await setup()
  // call the onMessage fn with data obj + message obj
  await listener.onMessage(data, message)

  // write assertions to make sure ack fn was called
  expect(message.ack).toHaveBeenCalled()
})
