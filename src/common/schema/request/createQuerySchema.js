export const createQuerySchema = () => {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'JsonApiQuery',
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        examples: [50]
      },
      offset: {
        type: 'number',
        examples: [1]
      }
    }
  }
}
