export const CONTENT_TYPE = 'application/vnd.api+json; charset=utf-8'

export const PROBLEM_CONTENT_TYPE = 'application/problem+json; charset=utf-8'

/**
 * Defines constants representing different request segments for API validation.
 *
 * @constant
 * @type {Object}
 * @property {string} BODY - Represents the request body.
 * @property {string} COOKIES - Represents request cookies.
 * @property {string} FILES - Represents uploaded files in the request.
 * @property {string} HEADERS - Represents request headers.
 * @property {string} PARAMS - Represents URL parameters.
 * @property {string} QUERY - Represents query parameters.
 * @property {string} RESPONSE - Represents the response schema.
 * @property {string} SIGNEDCOOKIES - Represents signed cookies in the request.
 */
export const REQUEST_SEGMENTS = {
  BODY: 'body',
  COOKIES: 'cookies',
  FILES: 'files',
  HEADERS: 'headers',
  PARAMS: 'params',
  QUERY: 'query',
  RESPONSE: 'response',
  SIGNEDCOOKIES: 'signedCookies'
}
