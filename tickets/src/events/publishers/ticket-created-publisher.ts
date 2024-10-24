import { Publisher, Subjects, TicketCreatedEvent } from '@nsmtickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
