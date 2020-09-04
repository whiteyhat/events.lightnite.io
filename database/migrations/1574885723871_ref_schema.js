'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RefSchema extends Schema {
  up () {
    this.create('refs', (table) => {
      table.increments()
      table.string('key').notNullable().unique()
      table.string('source').notNullable().unique()
      table.string('source_url').notNullable().unique()
      table.string('msg')
      table.timestamps()
    })
  }

  down () {
    this.drop('refs')
  }
}

module.exports = RefSchema
