import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-grup-name'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    })

    await order.save()

    msg.ack()
  }
}
