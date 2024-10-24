import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { TicketUpdatedListener } from '../ticket-updated-listener'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'Title',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()

  // create fake data event

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
    // updated fields
    title: 'New Title',
    price: 15,
  }

  // create fake message obj
  const message = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, data, message }
}

it('should find, update and save a ticket', async () => {
  const { listener, data, message } = await setup()

  // call the onMessage fn with data obj + message obj
  await listener.onMessage(data, message)

  // write assertions to make sure a ticket was updated
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket?.title).toEqual(data.title)
  expect(ticket?.price).toEqual(data.price)
  expect(ticket?.version).toEqual(data.version)
})

it('should ack the message', async () => {
  const { listener, data, message } = await setup()
  // call the onMessage fn with data obj + message obj
  await listener.onMessage(data, message)

  // write assertions to make sure ack fn was called
  expect(message.ack).toHaveBeenCalled()
})

it('should not call ack if the event has an out of sync version number', async () => {
  const { listener, data, message } = await setup()

  data.version = 10

  try {
    await listener.onMessage(data, message)
  } catch (error) {
    expect(error).toBeDefined()
  }

  expect(message.ack).not.toHaveBeenCalled()
})
