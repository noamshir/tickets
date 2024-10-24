import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@nsmtickets/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { isValidObjectId } from 'mongoose'

import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Sent an invalid id')
    }

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      throw new NotFoundError()
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved, cant update!')
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    })
    await ticket.save()

    const publisher = new TicketUpdatedPublisher(natsWrapper.client)
    await publisher.publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })

    return res.send(ticket)
  }
)

export { router as updateTicketRouter }
