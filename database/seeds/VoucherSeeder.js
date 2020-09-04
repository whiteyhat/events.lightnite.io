'use strict'

const Factory = use('Factory')
const Voucher = use('App/Models/Voucher')
const uuidv4 = require('uuid/v4')

class VoucherSeeder {
  async run () {
    for (let index = 0; index < 100; index++) {
      await Voucher.create({
        key: uuidv4(),
        discount: 100
      })
    }
  }
}

module.exports = VoucherSeeder
