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
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
// init db
require('./dbs/init.mongodb')
const { countConnect } = require('./helpers/checkConnect')

// init route
app.use('/', require('./routers/index'))
// handle error
app.use((req, res, next)=> {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next)=> {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error.message || 'Internal Server Error'
  })
  error.status = 404
  next(error)
})

module.exports = app