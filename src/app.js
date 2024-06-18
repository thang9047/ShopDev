const compression = require('compression')
require('dotenv').config()
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// console.log(`Process:: `, process.env)
// init middleware
// app.use(morgan('combined'))
app.use(morgan('dev'))
app.use(helmet()) 
app.use(compression()) 
// init db
require('./dbs/init.mongdb')
const { countConnect } = require('./helpers/checkConnect')

// init route
app.use('/', require('./routers/index'))
// handle error

module.exports = app