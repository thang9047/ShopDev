'use strict'

const express = require('express')
const { route } = require('./access')
const { apiKey, permission } = require('../auth/checkAuth')

const router = express.Router()

// Check Api Key
router.use(apiKey)
// Check permission
router.use(permission('0000'))
router.use('/v1/api', require('./access'))

module.exports = router