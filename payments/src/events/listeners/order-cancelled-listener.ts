import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-grup-name'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data)
    if (!order) {
      throw new Error('Order not found')
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()

    msg.ack()
  }
}
