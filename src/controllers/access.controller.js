'use strict'

const { CreatedResponse, SuccessResponse } = require("../handleResponse/success.response")
const AccessService = require("../services/access.service")

class AccessController {
  signUp = async (req, res, next) => {
      new CreatedResponse({
        message: 'Register OK',
        metadata: await AccessService.signUp(req.body)
      }).send(res)
  }

  login = async (req, res, next ) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res)
  }

  logout = async (req, res, next ) => {
    new SuccessResponse({
      message: 'Logout success',
      metadata: await AccessService.logout(req.keyStored)
    }).send(res)
  }

  handleRefreshToken = async (req, res, next ) => {
    new SuccessResponse({
      message: 'Get new token Success::',
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    }).send(res)
  }

}

module.exports = new AccessController()