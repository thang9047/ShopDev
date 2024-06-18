'use strict'
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const shopModel = require("../models/shop.model")

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: '0001',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}
class AccessService {

  static signUp = async ({email, password, name}) => {
    try {
      const hodelShop = await shopModel.findOne({email}).lean()
      if(hodelShop){
        return {
          code: 'xxx',
          message: 'Shop already exist!'
        }
      }

      const hashPassword = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name, email, password: hashPassword, roles: [RoleShop.SHOP]
      })

      if (newShop) {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096
        })

        console.log({ privateKey, publicKey })
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