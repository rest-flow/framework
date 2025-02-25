const schemas = []

/**
 * Gets the schema tags split by uppercase letters
 *
 * @param {string[]} tag
 * @returns {string}
 */
export const getSchemaTags = (tags) => tags.map(tag => tag.split(/(?=[A-Z])/).join(' '))

/**
 *
 * @param {string} domain
 * @returns {object[]} // TODO: create correct type
 */
export const getDomainSchemas = (domain) => {
  return schemas[domain]
}

/**
 *
 * @returns {object} // TODO: create correct type
 */
export const getSchemas = () => {
  return schemas
}

/**
 *
 * @param {string} id
 * @param {object} schema // TODO: create correct type
 */
export const registerSchema = (id, schema) => {
  schemas.push({
    $id: id,
    schema,
  })
}

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
export const addSchemas = (app) => {
  const tags = []

  for (const schema of getSchemas()) {
    app.addSchema(schema)

    tags.push(schema.$id)
  }

  return getSchemaTags(tags)
}
