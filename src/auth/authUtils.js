'use strict'
const jwt = require('jsonwebtoken')

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: '1h'
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

module.exports = {
  createTokenPair
}