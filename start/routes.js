'use strict'

const Route = use('Route')

Route.on('/').render('pages.home')
Route.on('/terms').render('pages.terms')
Route.on('/privacy').render('pages.privacy')
Route.on('/comments').render('pages.comments')

Route.get('/redeem', 'GameController.renderRedeem')
Route.get('/redeem/code=:code', 'GameController.renderRedeem')
Route.get('/redeem/msg=:msg', 'GameController.renderRedeem')

Route.group(() => {
  /*
    |-----------------------------------------------------------------
    |                           GAME MANAGEMENT
    |-----------------------------------------------------------------
    */
  Route.post('/voucher/redeem', 'GameController.redeem')
  Route.post('/add/contact', 'GameController.issueGamePurchase')
  Route.post('/purchase', 'GameController.purchased')
  Route.post('/withdraw', 'GameController.issueWithdrawal')
}).prefix('api/v1')
