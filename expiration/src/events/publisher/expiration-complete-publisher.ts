import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@nsmtickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
