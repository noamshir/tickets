import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@nsmtickets/common'
import express, { Request, Response } from 'express'
import { Order } from '../models/order'
import { isValidObjectId } from 'mongoose'

const router = express.Router()

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params
    if (!isValidObjectId(orderId)) {
      throw new BadRequestError('Sent an invalid id')
    }

    const order = await Order.findById(orderId).populate('ticket')
    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    res.send(order)
  }
)

export { router as showOrderRouter }
