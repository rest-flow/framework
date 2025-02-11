const schemas = {}

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
 * @param {string} domain
 * @param {string} id
 * @param {object} schema // TODO: create correct type
 */
export const registerSchema = (domain, id, schema) => {
  (schemas[domain] ??= []).push({
    $id: id,
    ...schema
  })
}

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
export const addSchemas = (app) => {
  const tags = []

  for (const schemas of Object.values(getSchemas())) {
    for (const schema of schemas) {
      app.addSchema(schema)

      tags.push(schema.$id)
    }
  }

  return tags
}
