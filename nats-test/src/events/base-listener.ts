import { Message, Stan, SubscriptionOptions } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
  subject: Subjects
  data: any
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject']
  abstract queueGroupName: string
  abstract onMessage(data: T['data'], msg: Message): void
  private client: Stan
  // 5 seconds
  protected ackWait: number = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions(): SubscriptionOptions {
    return (
      this.client
        .subscriptionOptions()
        // make sure we process events that we missed
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(this.ackWait)
        // make sure we dont reprocess the events we already ran (with queue group),
        // without queue group nats is clearing the events history for this durable subscription
        .setDurableName(this.queueGroupName)
    )
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on('message', (msg: Message) => {
      console.log(`Message received ${this.subject} / ${this.queueGroupName}`)
      const parsedData = this.parseMessage(msg)
      this.onMessage(parsedData, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8'))
  }
}
