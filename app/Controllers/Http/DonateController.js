'use strict'

const Product = use('App/Models/Product')
const Donate = use('App/Models/Donate')

class DonateController {
  async index ({ response, auth }) {
    const user = await auth.getUser()

    const donatesPrepare = Donate
      .query()
      .with('user', builder => {
        builder.select(['id', 'fullName', 'phone'])
      })
      .with('product', builder => {
        builder.select(['id', 'name', 'category'])
      })
      .select('id', 'user_id', 'product_id')

    const donatesFetch = user.admin
      ? await donatesPrepare
        .fetch()
      : await donatesPrepare
        .where('user_id', user.id)
        .fetch()

    const donates = donatesFetch.toJSON().map(donate => {
      delete donate.user_id
      delete donate.product_id
      return donate
    })

    return response.json({
      status: 'success',
      data: { donates }
    })
  }

  async show ({ params, auth, response }) {
    const donate = await Donate.find(params.id)
    const user = auth.getUser()

    if (donate === null) {
      return response.json({
        status: 'warning',
        messages: ['Doação não encontrada.']
      })
    }

    if (donate.user_id !== user.id) {
      return response.status(400).json({
        status: 'error',
        messages: ['Acesso negado.']
      })
    }

    await donate.load('user', builder => {
      builder.select('id', 'fullName')
    })

    await donate.load('product', builder => {
      builder.select('id', 'name', 'category')
    })

    const donateJSON = donate.toJSON()

    delete donateJSON.user_id
    delete donateJSON.product_id
    delete donateJSON.created_at
    delete donateJSON.updated_at

    return response.json({
      status: 'success',
      data: {
        donate: donateJSON
      }
    })
  }

  async store ({ request, auth, response }) {
    const errorMessages = []
    const { product: productID } = request.only(['user', 'product'])

    const user = await auth.getUser()
    const product = await Product.find(productID)
    const productDonations = await Donate
      .query()
      .where('product_id', productID)
      .select('id')
      .fetch()

    if (product === null) {
      errorMessages.push('O produto não consta na base de dados.')
    }

    if (productDonations.toJSON().length >= (product || {}).donate_limit) {
      errorMessages.push('O produto não está mais disponível para doação.')
    }

    if (errorMessages.length > 0) {
      return response.status(400).json({
        status: 'error',
        messages: errorMessages
      })
    }

    await Donate.create({
      user_id: user.id,
      product_id: productID
    })

    return response.json({
      status: 'success',
      data: null
    })
  }

  async destroy ({ auth, params, response }) {
    const errorMessages = []
    const user = await auth.getUser()
    const donate = await Donate.find(params.id)

    const { id: donateUserID } = (donate && await donate.user().fetch()) || {}

    if (donate === null) {
      errorMessages.push('A doação não está registrada.')
    }

    if (donateUserID && donateUserID !== user.id) {
      errorMessages.push('Operação negada.')
    }

    if (errorMessages.length > 0) {
      return response.status(400).json({
        status: 'error',
        messages: errorMessages
      })
    }

    await donate.delete()

    return response.json({
      status: 'success',
      data: null
    })
  }
}

module.exports = DonateController
