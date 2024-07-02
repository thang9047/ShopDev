'use strict'

const { Schema, Types, model } = require('mongoose')

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

var keyTokenSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        required:true,
        ref : 'Shop',
    },
    publicKey:{
        type:String,
        required:true
    },
    privateKey:{
      type:String,
      required:true
  },
    refreshTokensUsed:{
        type:Array,
        default: [],
    },
    refreshToken:{
        type:String,
        required: true
    },
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);