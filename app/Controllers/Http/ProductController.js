'use strict'

const Product = use('App/Models/Product')

class ProductController {
  async index ({ response }) {

    const products = await Product
      .query()
      .withCount('donates')
      .fetch()

    return response.json({
      status: 'success',
      data: {
        products
      }
    })
  }
}

module.exports = ProductController
