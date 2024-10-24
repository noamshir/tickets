import { Publisher, OrderCreatedEvent, Subjects } from '@nsmtickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
