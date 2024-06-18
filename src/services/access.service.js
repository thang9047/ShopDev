'use strict'
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const shopModel = require("../models/shop.model")
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: '0001',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {

  static signUp = async ({email, password, name}) => {
    try {
      const shop = await shopModel.findOne({email}).lean()
      if(shop){
        return {
          code: 400,
          message: 'Shop already exist!'
        }
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
          return {
            code: 'xxx',
            message: 'keyStore error'
          }
        }

        const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)

        console.log(`Created token success::`, tokens)

        return {
          code: 200,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
            tokens
          }
        }
      }
      
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService