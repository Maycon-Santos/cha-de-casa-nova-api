'use strict'

const fs = require('fs')
const path = require('path')

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class ProductsSchema extends Schema {
  up () {
    this.create('products', async (table) => {
      table.increments()
      table.string('name', 255).notNullable()
      table.string('category', 100).notNullable()
      table.int('donate_limit', 2).defaultTo(1)

      const productsBuffer = fs.readFileSync(path.resolve('database/products.json'))
      const products = JSON.parse(productsBuffer)

      await Database
        .table('products')
        .insert(products)
    })
  }

  down () {
    this.drop('products')
  }
}

module.exports = ProductsSchema
