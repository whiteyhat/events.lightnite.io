'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SkinsSchema extends Schema {
  up () {
    this.create('skins', (table) => {
      table.increments()
      table.string('key').notNullable().unique()
      table.string('name').notNullable().unique()
      table.string('image').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('skins')
  }
}

module.exports = SkinsSchema
