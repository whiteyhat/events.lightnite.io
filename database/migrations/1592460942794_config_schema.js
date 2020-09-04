'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigSchema extends Schema {
  up () {
    this.create('configs', (table) => {
      table.increments()
      table.integer('skin_id').unsigned().references('id').inTable('skins')
      table.integer('price').notNullable().unique().defaultTo(20)
      table.boolean('maintenance').notNullable().unique().defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('configs')
  }
}

module.exports = ConfigSchema
