import { PaymentCreatedEvent, Publisher, Subjects } from '@nsmtickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
