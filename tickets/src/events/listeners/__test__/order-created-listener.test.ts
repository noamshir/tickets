import { OrderCreatedEvent, OrderStatus } from '@nsmtickets/common'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'Title',
    price: 99,
    userId: 'asasa',
  })
  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'fake',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: Number(ticket.price),
    },
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, ticket, data, msg }
}

it('should set the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('should acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('should publish a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const publishFn = natsWrapper.client.publish
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  if (jest.isMockFunction(publishFn)) {
    const ticketUpdatedData = JSON.parse(publishFn.mock.calls[0][1])
    expect(ticketUpdatedData.orderId).toEqual(data.id)
  }
})
