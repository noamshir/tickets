import { BadRequestError, NotFoundError } from '@nsmtickets/common'
import express, { Request, Response } from 'express'

import { Ticket } from '../models/ticket'
import { isValidObjectId } from 'mongoose'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  if (!isValidObjectId(id)) {
    throw new BadRequestError('Sent an invalid id')
  }

  const ticket = await Ticket.findById(id)
  if (!ticket) {
    throw new NotFoundError()
  }

  res.send(ticket)
})

export { router as showTicketRouter }
