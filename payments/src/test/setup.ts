import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
  var signin: (id?: string) => string[]
}

jest.mock('../nats-wrapper')

global.signin = (id?: string) => {
  // Build a JWT payload.
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'fake@email.com',
  }

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  // Build session Object
  const session = { jwt: token }

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // Return a string of the cookie with the encoded data
  return [`session=${base64}`]
}

process.env.STRIPE_KEY =
  'sk_test_51QClmTKoKsZ6na6hpPt08qXYCQFvORl4VF0iLnaoTlmkkXmgix8XWmydz6el1Ij9fMA5Gr6cWuYO7XmtjKt0gH2E00BMdwnGee'

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'koko'
  const mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()

  await mongoose.connect(mongoUri, {})
})

beforeEach(async () => {
  jest.clearAllMocks()

  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections) {
      await collection.deleteMany({})
    }
  }
})

afterAll(async () => {
  if (mongo) {
    await mongo.stop()
  }
  await mongoose.connection.close()
})
