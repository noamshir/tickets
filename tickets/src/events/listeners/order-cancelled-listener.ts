import { Listener, OrderCancelledEvent, Subjects } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { Ticket } from '../../models/ticket'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)
    if (!ticket) {
      throw new Error('Ticket not found!')
    }

    ticket.set({ orderId: undefined })
    await ticket.save()

    const publisher = new TicketUpdatedPublisher(this.client)
    await publisher.publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    })

    msg.ack()
  }
}
