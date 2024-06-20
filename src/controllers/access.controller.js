'use strict'

const { CreatedResponse } = require("../handleResponse/success.response")
const AccessService = require("../services/access.service")

class AccessController {
  signUp = async (req, res, next) => {
      new CreatedResponse({
        message: 'Register OK',
        metadata: await AccessService.signUp(req.body)
      }).send(res)
  }
}

module.exports = new AccessController()