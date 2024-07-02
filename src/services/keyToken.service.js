'use strict'  
const { Types } = require('mongoose')
const keyTokenModel = require('../models/keytoken.model')

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken}) => {
    try {
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey
      // })

      // return tokens ? tokens.publicKey : null

      const filter = { user: userId}, update = {
        publicKey, privateKey, refreshTokensUsed: [], refreshToken
      }, options = {
        upsert: true,
        new: true
      }

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }

  static findByUserId = async ( {userId} ) => {
    return await keyTokenModel.findOne({ user: new Types.ObjectId(userId)}).lean()
  }

  static removeKeyById = async ( {id} ) => {
    const result = await keyTokenModel.deleteOne({ _id: new Types.ObjectId(id)})
    return result
  }

  static findRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
  }

  static findRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken })
  }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.findByIdAndDelete(userId)
  }
}


module.exports = KeyTokenService