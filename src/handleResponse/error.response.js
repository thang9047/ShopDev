'use strict'

const { StatusCodes } = require("../utils/httpStatusCode")
const reasonPhrases = require("../utils/reasonPhrases")

// const StatusCode = {
//   FORBIDDEN: 403,
//   CONFLICT: 409
// }

// const ReasonStatusCode = {
//   FORBIDDEN: 'Bad request error',
//   CONFLICT: 'Conflict error'
// }

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = reasonPhrases.FORBIDDEN, statusCode = StatusCodes.FORBIDDEN) {
    super(message, statusCode)
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message = reasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT) {
    super(message, statusCode)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = reasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED) {
    super(message, statusCode)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = reasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND) {
    super(message, statusCode)
  }
}

module.exports = {
  BadRequestError,
  ConflictRequestError, 
  AuthFailureError,
  NotFoundError
}