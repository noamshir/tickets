import { Publisher, Subjects, OrderCancelledEvent } from '@nsmtickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
