'use strict'
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const shopModel = require("../models/shop.model")
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError } = require('../handleResponse/error.response')
const { findByEmail } = require('../services/shop.service')
const { ObjectId } = require('mongoose').ObjectId

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {

  static signUp = async ({email, password, name}) => {
      const shop = await shopModel.findOne({email}).lean()
      if(shop){
        throw new BadRequestError('Shop already registered !')
      }
      const hashPassword = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name, email, password: hashPassword, roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // RSA 
        // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        //   modulusLength: 4096, 
        //   publicKeyEncoding:  { type: 'pkcs1', format: 'pem' },
        //   privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
        // })

        const { privateKey, publicKey } = generateKeyPair()
        const { _id: userId } = newShop._id
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        // Lưu public key vào db
        const keyStore = await KeyTokenService.createKeyToken({
          userId,
          publicKey, 
          privateKey,
          refreshToken: tokens.refreshToken
        })

        if (!keyStore) {
          throw new BadRequestError('Keystore Error!')
        }

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
      }
  }

  static login = async ( {email, password, refreshToken = null}) => {
    const foundShop = await findByEmail({ email })
    if(!foundShop) throw new BadRequestError('Shop has not registered !')

    const matchPassword = await bcrypt.compare(password, foundShop.password)

    if (!matchPassword) throw new AuthFailureError('Authentication Error !')

    const { privateKey, publicKey } = generateKeyPair()

    const { _id: userId } = foundShop._id
    const tokens = await createTokenPair({ userId, email}, publicKey, privateKey)

    const keyStored = await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey, 
      refreshToken: tokens.refreshToken
    })

    if (!keyStored) {
      throw new BadRequestError('Keystore Error!')
    }

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop}),
      tokens
    }
  }

  static logout = async ( keyStored ) => {
    const delKey = await KeyTokenService.removeKeyById(keyStored._id)
    console.log({ delKey })
    return delKey
  }

  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findRefreshTokenUsed(refreshToken)

    if(foundToken) {
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log('[1]----', { userId, email })

      await KeyTokenService.deleteKeyById(foundToken._id)
      throw new BadRequestError('Some thing wrong, please Re login')
    }

    const holderToken = await KeyTokenService.findRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('Shop not registered !!')
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
    console.log('[2]---', { userId, email })

    const foundShop = await findByEmail( {email} )
    if (!foundShop) throw new AuthFailureError('Shop not registered !!')

    const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    // holderToken.refreshToken = tokens.refreshToken
    // holderToken.refreshTokensUsed.push(refreshToken)
    // holderToken.save()

    return { 
      user: { userId, email },
      tokens
    }

  }
}



const generateKeyPair = () => {
  const privateKey = crypto.randomBytes(64).toString('hex')
  const publicKey = crypto.randomBytes(64).toString('hex')

  return { privateKey, publicKey }
}

module.exports = AccessService