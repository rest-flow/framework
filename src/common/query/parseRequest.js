export const parseRequest = (url) => {
  const urlObj = new URL(decodeURIComponent(url), 'http://domain.com') // Base needed for relative URLs
  // const searchParams = urlObj.searchParams
  const pathSegments = urlObj.pathname.split('/').filter(Boolean)

  // return {
  //   ...parsePagination(searchParams),
  //   sort: parseSort(searchParams.get('sort') ?? '')
  // }

  const [resourceType, identifier] = pathSegments

  const request = {
    resourceType,
    identifier
  }

  const pagination = parsePagination(urlObj.searchParams)

  if (pagination) {
    request.pagination = pagination
  }

  return request
}

/**
 *
 * @param {import(import("fastify").FastifyRequest['query'])} query
 * @returns {} // TODO: crate this type
 */
const parsePagination = (searchParams) => {
  // if (!query.limit && !query.offset) {
  //   return undefined
  // }

  // return {
  //   limit: query?.limit,
  //   offset: query?.offset
  // }
  const pagination = {}

  for (const [key, value] of searchParams.entries()) {
    if (key === 'limit') {
      pagination.limit = parseInt(value, 10)
    }

    if (key === 'offset') {
      pagination.offset = parseInt(value, 10)
    }
  }

  return pagination
}
