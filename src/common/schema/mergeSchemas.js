export const mergeSchemas = (initial, ...schemas) => {
  // const merged = structuredClone(initial)

  return schemas.reduce((merged, schema) => {
    merged.properties = { ...merged.properties, ...schema.properties }

    if (schema.required) {
      (merged.required ??= []).push(...schema.required ?? [])
    }

    return merged
  }, structuredClone(initial))
}
