import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log(`Waiting ${delay} ms to process the job`)
    await expirationQueue.add({ orderId: data.id }, { delay })

    msg.ack()
  }
}
