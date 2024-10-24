import { Listener, OrderCreatedEvent, Subjects } from '@nsmtickets/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { natsWrapper } from '../../nats-wrapper'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    ticket.set({ orderId: data.id })
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
