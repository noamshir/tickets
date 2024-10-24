import mongoose, { set } from 'mongoose'
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { ExpirationCompleteEvent } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  })
  await ticket.save()

  const order = Order.build({
    userId: 'fakeUser',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket,
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, order, ticket, data, msg }
}
it('should cancel an order', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const fetchedOrder = await Order.findById(order.id)
  expect(fetchedOrder?.status).toEqual(OrderStatus.Cancelled)
})

it('should emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const publishFn = natsWrapper.client.publish
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  if (jest.isMockFunction(publishFn)) {
    const dataArgForPublisher = JSON.parse(publishFn.mock.calls[0][1])
    expect(dataArgForPublisher.id).toEqual(order.id)
  }
})

it('should ack the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
