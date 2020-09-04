'use strict'
const axios = require('axios')
const Env = use('Env')
const backendCall = async ({ path, method = 'post', body }) => {
  const { data } = await axios({
    method,
    url: `${process.env.NEW_API}${path}`,
    data: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return data ? data.data : undefined
}
const calculateType = (supply = 0) => {
  if (supply > 100 && supply <= 500) {
    return 'PREMIUM'
  }
  if (supply > 1 && supply <= 100) {
    return 'RARE'
  }
  if (supply === 1) {
    return 'LEGENDARY'
  }
  return 'COMMON'
}
class GameController {
  async renderRedeem ({ view, params }) {
    const msg = params.msg
    const code = params.code
    try {
      // TRAILER 'https://youtu.be/Sem9l2f_SKg'
      // BINANCE 'https://youtu.be/5RancVOfrKI'
      // BLUEWALLET 'https://youtu.be/M1ELco3q6OQ'
      // ZAP 'https://youtu.be/kFfSoAjbJLc'
      // MCF 'https://youtu.be/gfoozq3ANII'
      // BLOCKSTREAM 'https://youtu.be/U-Gs425bL2o'
      return view.render('pages.redeem', { video: 'https://youtu.be/5RancVOfrKI', type: msg, msg: 'Game successfully purchased with NFT', code })
    } catch (error) {
      console.log(error)
    }
  }

  async redeem ({ request, response }) {
    try {
      const { voucher } = request.all()

      // console.log(voucher)

      const [voucherGiven] = await Promise.all([
        backendCall({ path: '/payments/voucher/redeem', body: { code: voucher } })
      ])

      if (voucherGiven) {
        console.log(voucherGiven)
        if (voucherGiven.voucher.type === 'SKIN') {
          const item = {
            image: `//d2cb3hgqwhjsel.cloudfront.net/${voucherGiven.asset.category}/${voucherGiven.asset.tag}/`,
            name: voucherGiven.asset.name,
            supply: calculateType(voucherGiven.asset.supply),
            assetId: voucherGiven.asset.id
          }
          return response.send({ type: 'success', msg: 'Congratulations!', item, winner: voucherGiven.voucher.email })
        }
        return response.send({ type: 'danger', msg: 'INVALID VOUCHER' })
      }
    } catch (error) {
      return response.send({ type: 'danger', msg: error.response.data.error.message })
    }
  }

  async issueGamePurchase ({ request, response }) {
    try {
      const { email, assetId, type } = request.all()
      if (type === 'card') {
        console.log('-- request stripe payment')
        // Add user to mautic
        let AddContactToBuyerSegement
        try {
          AddContactToBuyerSegement = await axios({
            method: 'post',
            url: Env.get('MAUTIC_URL') + '/contacts/new',
            headers: { Authorization: 'Basic ' + Env.get('MAUTIC_AUTH_TOKEN'), 'Content-Type': 'application/json' },
            data: {
              email
            }
          })
        } catch (error) {
          console.log(error.response)
        }

        if (AddContactToBuyerSegement.data) {
          try {
            // Add contact to segement
            await axios({
              method: 'post',
              url: Env.get('MAUTIC_URL') + '/segments/8/contact/' + AddContactToBuyerSegement.data.contact.id + '/add',
              headers: { Authorization: 'Basic ' + Env.get('MAUTIC_AUTH_TOKEN'), 'Content-Type': 'application/json' }
            })

            console.log('-- contact added to segments')
          } catch (error) {
            console.log(error.response)
          }
        }
        return
      }

      console.log('-- request bitcoin payment')

      const { data } = await axios({
        method: 'post',
        data: {
          price: 12,
          buyerEmail: email,
          posData: assetId,
          redirectUrl: 'https://events.lightnite.io/redeem/msg=success'
        },
        url: `${process.env.NEW_API}/payments/game`,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (data) {
        console.log(data)
        return response.send({ id: data.data })
      }
    } catch (error) {
      console.log(error.response)
    }
  }

  async purchased ({ request, response }) {
    try {
      const { id } = request.all()
      console.log('invoice id')
      console.log('- skin withdrawal requested')

      if (id !== undefined) {
        const { data } = await axios({
          method: 'get',
          url: 'https://buy.lightnite.io/invoices/' + id,
          headers: {
            Authorization: 'Basic N0JsaUhHb0IxVzdFV29RUFZrZGhwMGtkbkREUjBZaURkV0RvSElCdkUxZA==',
            'Content-Type': 'application/json'
          }
        })
        if (data) {
          if (data.data.status === 'confirmed' || data.data.status === 'paid' || data.data.status === 'complete') {
            if (data.data.price !== undefined) {
              if (data.data.price === 2) {
                console.log('- skin withdrawal confirmed')
                const { address } = JSON.parse(data.data.posData)
                const { assetId } = JSON.parse(data.data.posData)
                console.log('address', address)
                console.log('assetId', assetId)
                const [withdrawal] = await Promise.all([
                  backendCall({ path: '/skins/guest/' + assetId + '/withdraw', body: { address, email: data.data.buyer.email } })
                ])

                if (withdrawal) {
                  return response.send({ type: 'success', result: withdrawal.id })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
      return response.send({ type: 'error' })
    }
  }

  async issueWithdrawal ({ request, response }) {
    try {
      const { email, assetId, address } = request.all()
      console.log(request.all())
      const [purchase] = await Promise.all([
        backendCall({
          path: '/payments/new/',
          body: {
            description: 'PAY FOR LIQUID SIDECHAIN FEES - LIGHTNITE',
            buyerEmail: email,
            price: 1,
            id: 'LIQUID-WITHDRAWAL',
            // notificationUrl: 'https://9dbaec672c63.ngrok.io/api/v1/purchase',
            notificationUrl: `https://${process.env.WEB_DOMAIN}` + '/api/v1/purchase',
            redirectUrl: `${process.env.BTCPAY_REDIRECT_URL}/${assetId}`,
            posData: {
              address,
              assetId
            }
          }
        })
      ])

      if (purchase) {
        // console.log(purchase)
        return response.send({ type: 'success', msg: 'Invoice created', id: purchase.id })
      }
    } catch (error) {
      console.log(error)
      return response.send({ type: 'error' })
    }
  }
}

module.exports = GameController
