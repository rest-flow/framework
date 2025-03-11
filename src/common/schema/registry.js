const schemas = []

/**
 * Gets the schema tags split by uppercase letters
 *
 * @param {string[]} tag
 * @returns {string}
 */
export const getSchemaTags = (schemas) => {
  return schemas.reduce((tags, schema) => {
    tags.push(schema.$id.split(/(?=[A-Z])/).join(' '))

    return tags
  }, [])
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
  const schemas = getSchemas()

  for (const schema of schemas) {
    app.addSchema(schema)
  }

  return getSchemaTags(schemas)
}
