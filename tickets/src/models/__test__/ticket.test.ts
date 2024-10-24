import { Ticket } from '../ticket'

it('should implements optimistic concurrency control', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: '20',
    userId: '123',
  })
  // Save the ticket
  await ticket.save()

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 })
  secondInstance!.set({ price: 20 })

  // save the first one
  await firstInstance!.save()

  // save the second and expect an error
  try {
    await secondInstance!.save()
  } catch (error) {
    return
  }

  throw new Error('Should not reach here!!!')
})

it('should increments the version number on multiple saves', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: '20',
    userId: '123',
  })
  // Save the ticket
  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)
})
