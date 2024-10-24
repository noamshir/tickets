import request from 'supertest'
import mongoose from 'mongoose'
import { OrderStatus } from '@nsmtickets/common'

import { app } from '../../app'
import { stripe } from '../../stripe'
import { Order } from '../../models/order'
import { Payment } from '../../models/payment'

// using stripe mock approach
// jest.mock('../../stripe')

it('should return a 404 when creating a payment for order does not exits', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'fake-token',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it('should return a 401 when creating a payment and the order does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'fake-token',
      orderId: order.id,
    })
    .expect(401)
})

it('should return a 400 when creating a payment for a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId,
    price: 100,
    status: OrderStatus.Cancelled,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'fake-token',
      orderId: order.id,
    })
    .expect(400)
})

it('should returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId,
    price: Math.floor(Math.random() * 10000),
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  const recentStripeCharges = await stripe.charges.list({
    limit: 50,
  })

  const stripeCharge = recentStripeCharges.data.find(
    (charge) => charge.amount === order.price * 100
  )
  expect(stripeCharge).toBeDefined()
  expect(stripeCharge?.currency).toEqual('usd')

  // using stripe mock approach
  // const createChargeFn = stripe.charges.create
  // expect(createChargeFn).toHaveBeenCalled()
  // if (jest.isMockFunction(createChargeFn)) {
  //   const chargeOptions = createChargeFn.mock.calls[0][0]
  //   expect(chargeOptions.source).toEqual('tok_visa')
  //   expect(chargeOptions.amount).toEqual(order.price * 100)
  //   expect(chargeOptions.currency).toEqual('usd')
  // }
})

it('should returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    userId,
    price: Math.floor(Math.random() * 10000),
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  const recentStripeCharges = await stripe.charges.list({
    limit: 50,
  })

  const stripeCharge = recentStripeCharges.data.find(
    (charge) => charge.amount === order.price * 100
  )
  expect(stripeCharge).toBeDefined()
  expect(stripeCharge?.currency).toEqual('usd')

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge?.id,
  })
  expect(payment?.id).not.toBeNull()
})
