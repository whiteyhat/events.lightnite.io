'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class VouchersSchema extends Schema {
  up () {
    this.create('vouchers', (table) => {
      table.increments()
      table.string('key').notNullable().unique()
      table.integer('discount').notNullable().defaultTo(15)
      table.integer('uses').notNullable().defaultTo(1)
      table.timestamps()
    })
  }

  down () {
    this.drop('vouchers')
  }
}

module.exports = VouchersSchema
