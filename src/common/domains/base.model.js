import { toCamelCase } from 'drizzle-orm/casing'
import { count, eq, getTableName, sql } from 'drizzle-orm'

import { dataSource } from '../../data-source.js'
import { /* excludeFields,  */generateReturning, queryBuilder } from '../../common/index.js'
import { config } from '../../../config/index.js'

/**
 * Base modelfunction that provides common CRUD operations.
 *
 * @param {Schema} schema - The database table schema.
 * @param {Refine} [refine] - Optional additional methods to extend the base model.
 * @returns {Model & ExtraMethods} An object containing common CRUD methods for the specified schema.
 */
export const baseModel = (schema, refine = { hooks }) => {
  const tableName = toCamelCase(getTableName(schema))
  const { hooks, methods } = refine

  /**
   * Inserts a new record into the table.
   *
   * @param {Payload} payload - The data to insert.
   * @param {string[]} [excludedFields=[]] - Fields to exclude from the returning result.
   * @returns {Promise<Entity>} The inserted record data.
   */
  const create = (payload, excludedFields = []) => {
    return dataSource
      .getInstance()
      .insert(schema)
      .values(typeof hooks?.creating === 'function' ? hooks.creating(payload) : payload)
      .returning(generateReturning(schema, excludedFields))
      .then(data => typeof hooks?.created === 'function' ? hooks.created(data) : data)
  }

  /**
   * Deletes a record by ID.
   *
   * @param {RequestData} requestData - The request data containing the identifier for the record.
   * @returns {Promise<void>} The number of records deleted.
   */
  const deleteById = (requestData) => {
    return dataSource.getInstance().delete(schema).where(eq(schema.id, requestData.identifier))
  }

  /**
   * Retrieves all records from the table.
   *
   * @param {RequestData} requestData - The request data containing filters, if any.
   * @returns {Promise<GetAllResult>} The data and total record count.
   */
  const getAll = async (requestData, excludedFields = []) => {
    const query = queryBuilder(
      schema,
      requestData,
      excludedFields,
      config.database.pagination.limit
    )

    const dbInstance = dataSource.getInstance()

    // const [data, total] = await Promise.all([
    //   dbInstance.query[tableName].findMany(query),
    //   dbInstance.select({ count: count() }).from(schema).then(result => result[0].count)
    // ])

    const data = await dbInstance.query[tableName].findMany(query)
    const { total } = (await dbInstance.select({ total: count() }).from(schema))[0]

    return { data, total }
  }

  /**
   * Retrieves a single record by ID.
   *
   * @param {RequestData} requestData - The request data containing the identifier.
   * @param {string[]} [excludedFields=[]] - Fields to exclude from the query result.
   * @returns {Promise<Entity>} The record data.
   */
  const getById = (requestData, excludedFields = []) => {
    const query = queryBuilder(
      schema,
      requestData,
      excludedFields,
      config.database.pagination.limit
    )

    return dataSource.getInstance().query[tableName].findFirst(
      query
    )
  }

  /**
   * Updates specified fields of a record by ID.
   *
   * @param {string} id - The ID of the record to update.
   * @param {Payload} payload - The fields to update.
   * @param {string[]} [excludedFields=[]] - Fields to exclude from the returning result.
   * @returns {Promise<Entity>} The updated record data.
   */
  const patch = (id, payload/* , excludedFields = [] */) => {
    return dataSource
      .getInstance()
      .update(schema)
      .set({
        // ...payload,
        ...(typeof hooks?.updating === 'function' ? hooks.updating(payload) : payload),
        updated_at: sql`now()`
      })
      .where(eq(schema.id, id))
      .returning()
      .return(data => typeof hooks?.updated === 'function' ? hooks.updated(data) : data)
  }

  /**
   * Updates a record by ID.
   *
   * @param {string} id - The ID of the record to update.
   * @param {Payload} payload - The fields to update.
   * @param {string[]} [excludedFields=[]] - Fields to exclude from the returning result.
   * @returns {Promise<Entity>} The updated record data.
   */
  const update = (id, payload, excludedFields = []) => {
    return patch(id, payload, excludedFields)
  }

  return {
    create,
    deleteById,
    getAll,
    getById,
    patch,
    update,
    ...methods
  }
}

/**
 * @typedef {import("drizzle-orm/pg-core").TableConfig} Schema
 */

/**
 * @typedef {Object} Model
 * @property {(payload: Payload, excludedFields: string[]) => Promise<Entity>} create - Inserts a new record.
 * @property {(requestData: RequestData) => Promise<void>} deleteById - Deletes a record by ID.
 * @property {(requestData: RequestData) => Promise<GetAllResult>} getAll - Retrieves all records.
 * @property {(requestData: RequestData, excludedFields: string[]) => Promise<Entity>} getById - Retrieves a single record by ID.
 * @property {(id: string, payload: Payload, excludedFields: string[]) => Promise<Entity>} patch - Updates specified fields of a record.
 * @property {(id: string, payload: Payload, excludedFields: string[]) => Promise<Entity>} update - Updates a record by ID.
 */

/**
 * A number, or a string containing a number.
 * @typedef {object} Hooks
 * @property {(data: Objec<string, unknown>) => Promise<void>} [created]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [creating]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [deleted]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [deleting]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [retrieved]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [retrieving]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [saved]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [saving]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [updated]
 * @property {(data: Objec<string, unknown>) => Promise<void>} [updating]
 */

/**
 * @template T
 * @typedef {T extends keyof Model ? Model[T] : never} Method
 */

/**
 * @typedef {Partial<{
*   [K in keyof Model]: Method<K>;
* }>} ExtraMethods
*/

/**
 * A number, or a string containing a number.
 * @typedef {object} Refine
 * @property {Hooks} hooks
 * @property {ExtraMethods} methods
 */