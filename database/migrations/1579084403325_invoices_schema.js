'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class InvoicesSchema extends Schema {
  up () {
    this.create('invoices', (table) => {
      table.increments()
      table.string('invoice_id').notNullable().unique()
      table.integer('price').notNullable()
      table.string('status').notNullable().defaultTo('unpaid')
      table.string('ref').notNullable().defaultTo('N/A')
      table.timestamps()
    })
  }

  down () {
    this.drop('invoices')
  }
}

module.exports = InvoicesSchema
