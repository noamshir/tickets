import { OrderCancelledEvent, OrderStatus } from '@nsmtickets/common'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Order } from '../../../models/order'
import mongoose, { set } from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    version: 0,
    status: OrderStatus.Created,
    userId: 'fakeUserId',
  })
  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'fakeId',
    },
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return { listener, order, data, msg }
}

it('should update the order status', async () => {
  const { listener, order, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const fetchedOrder = await Order.findById(order.id)

  expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('should ack the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
