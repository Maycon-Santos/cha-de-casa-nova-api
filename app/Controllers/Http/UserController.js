'use strict'

const User = use('App/Models/User')

class UserController {
  async signIn ({ request, auth, response }) {
    try {
      const userData = request.only(['phone'])
      const user = await User.findBy('phone', userData.phone)

      if (user === null) {
        return response.json({
          status: 'success',
          data: {
            registered: false
          }
        })
      }

      const token = await auth.generate(user)

      return response.json({
        status: 'success',
        data: token
      })
    } catch (e) {
      return response.status(400).json({
        status: 'error',
        messages: [e]
      })
    }
  }

  async signup ({ request, auth, response }) {
    const userData = request.only(['fullName', 'phone'])

    try {
      const user = await User.create(userData)
      const token = await auth.generate(user)

      return response.json({
        status: 'success',
        data: token
      })

    } catch (e) {
      response.status(400).json({
        status: 'error',
        messages: [e]
      })
    }
  }
}

module.exports = UserController
