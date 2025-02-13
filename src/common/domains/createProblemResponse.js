import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export const createProblemResponse = (error) => {
  return {
    type: 'about:blank',
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    title: ReasonPhrases.INTERNAL_SERVER_ERROR,
    details: error.message
  }
}

export const fastifyErrorToProblem = (
  errors,
  status = 400,
  type = 'about:blank',
  title = 'Validation Error'
) => {
  if (!Array.isArray(errors)) {
    throw new Error('Invalid input: errors must be an array.')
  }

  return {
    type,
    title,
    status,
    detail: 'One or more validation errors occurred.',
    errors: errors.map(error => {
      const { instancePath, message, keyword, params } = error

      // Provide details for each error
      return {
        pointer: instancePath,
        details: message,
        keyword,
        params
      }
    })
  }
}
