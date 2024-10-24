import { requireAuth, validateRequest } from '@nsmtickets/common'
import express, { Response, Request } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { price, title } = req.body

    const ticket = Ticket.build({
      price,
      title,
      userId: req.currentUser?.id as string,
    })
    await ticket.save()

    const publisher = new TicketCreatedPublisher(natsWrapper.client)
    await publisher.publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })

    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
