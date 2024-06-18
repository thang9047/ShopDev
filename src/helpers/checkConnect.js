'use strict'

const  mongoose = require("mongoose")

const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Number Of Connect:: ${numConnection} `)
}

module.exports = {
  countConnect
}