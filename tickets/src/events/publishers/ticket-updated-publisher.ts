import { Publisher, Subjects, TicketUpdatedEvent } from '@nsmtickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdate
}
