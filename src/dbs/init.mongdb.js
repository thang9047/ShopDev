'use strict'

const mongoose = require('mongoose')
const { countConnect } = require('../helpers/checkConnect')

const { db: {host, name, port}} = require('../configs/config.mongodb')

const connectionString = `mongodb://${host}:${port}/${name}`
console.log(connectionString)
class Database {
  constructor(){
    this.connect()
  }

  connect(type = 'mongodb') {
    if(1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', {color: true})
    }
    mongoose.connect(connectionString).then( _ => console.log(`Connected success`, countConnect()))
    .catch( err => console.log(err))
  }

  static getInstance() {
    if(!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb