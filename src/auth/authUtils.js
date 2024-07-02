'use strict'
const jwt = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../handleResponse/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
  CLIENT_ID: 'x-client-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: '2h'
    })

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: '2 days'
    })

    jwt.verify( accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify:: `, err)
      }else {
        console.log(`decode verify:: `, decode)
      }
    })
    return { accessToken, refreshToken }
  } catch (error) {
    
  }
}

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request')

  const keyStored = await findByUserId( {userId} )
  if (!keyStored) throw new NotFoundError('Not found keyStore')

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  try {
    const decodeUser = jwt.verify(accessToken, keyStored.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
    req.keyStored = keyStored
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async(token, keySecret) => {
  return await jwt.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
}