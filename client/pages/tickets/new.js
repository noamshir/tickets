import { useState } from 'react'
import Router from 'next/router'

import { useRequest } from '../../hooks/use-request'

const NewTicket = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: (data) => Router.push('/'),
  })

  const onTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const onPriceChange = (e) => {
    setPrice(e.target.value)
  }

  const onPriceBlur = (e) => {
    const value = parseFloat(price)

    if (isNaN(value)) {
      return
    }

    setPrice(value.toFixed(2))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    await doRequest()
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label>Title</label>
          <input
            value={title}
            onChange={onTitleChange}
            className='form-control'
          />
        </div>
        <div className='form-group'>
          <label>Price</label>
          <input
            value={price}
            onBlur={onPriceBlur}
            onChange={onPriceChange}
            className='form-control'
          />
        </div>
        {errors}
        <button className='btn btn-primary'>Submit</button>
      </form>
    </div>
  )
}

export default NewTicket
