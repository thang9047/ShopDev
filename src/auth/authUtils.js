'use strict'
const jwt = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../handleResponse/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
  CLIENT_ID: 'x-client-id',
  REFRESH_TOKEN: 'refresh-token'
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
    req.user = decodeUser
    return next()
  } catch (error) {
    throw error
  }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request')

  const keyStored = await findByUserId( {userId} )
  if (!keyStored) throw new NotFoundError('Not found keyStore')

  if(req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
      const decodeUser = jwt.verify(refreshToken, keyStored.privateKey)
      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
      req.keyStored = keyStored
      req.refreshToken = refreshToken
      req.user = decodeUser
      return next()
    } catch (error) {
      throw error 
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  try {
    const decodeUser = jwt.verify(accessToken, keyStored.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid request')
    req.keyStored = keyStored
    req.user = decodeUser
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
  authenticationV2,
  verifyJWT
}