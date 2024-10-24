import { Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

interface Event {
  subject: Subjects
  data: any
}
export abstract class Publisher<T extends Event> {
  abstract subject: T['subject']
  private client: Stan

  constructor(client: Stan) {
    this.client = client
  }

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(data)

      this.client.publish(this.subject, json, (err: Error | undefined) => {
        if (err) {
          return reject(err)
        }

        console.log(`Event published to subject ${this.subject}`)

        resolve()
      })
    })
  }
}
