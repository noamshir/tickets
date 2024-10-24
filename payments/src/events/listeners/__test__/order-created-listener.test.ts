import { OrderCreatedEvent, OrderStatus } from '@nsmtickets/common'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'userId',
    expiresAt: 'timestamp',
    ticket: {
      id: 'fakeid',
      price: 100,
    },
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, data, msg }
}

it('should create an order', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const order = await Order.findById(data.id)
  expect(order).toBeDefined()
  expect(order?.price).toEqual(data.ticket.price)
})

it('should ack the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
