import mongoose from 'mongoose'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { OrderCancelledEvent } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'Title',
    price: 30,
    userId: new mongoose.Types.ObjectId().toHexString(),
  })
  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return { msg, data, ticket, listener, orderId }
}
it('should update the ticket (remove order id)', async () => {
  const { msg, data, ticket, listener, orderId } = await setup()

  await listener.onMessage(data, msg)

  const fetchedTicket = await Ticket.findById(ticket.id)
  expect(fetchedTicket?.orderId).not.toBeDefined()
})

it('should acks the message', async () => {
  const { listener, data, msg } = await setup()
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
    expect(ticketUpdatedData.orderId).not.toBeDefined()
  }
})
