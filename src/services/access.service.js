'use strict'
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const shopModel = require("../models/shop.model")
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError } = require('../handleResponse/error.response')

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

        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        console.log({privateKey, publicKey})
        // Lưu public key vào db
        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey, 
          privateKey
        })

        if (!keyStore) {
          throw new BadRequestError('Keystore Error!')
        }

        const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)

        console.log(`Created token success::`, tokens)

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
      }
  }
}

module.exports = AccessService