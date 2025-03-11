import { randomUUID } from 'node:crypto'

import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import csrfProtection from '@fastify/csrf-protection'
import fastify from 'fastify'
import fastifyCompress from '@fastify/compress'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { StatusCodes } from 'http-status-codes'

import { config } from '../config/index.js'
import { creteDefinition } from './openapi/createDefinition.js'
import * as routes from './domains/routes.js'
import { addSchemas, fastifyErrorToProblem, PROBLEM_CONTENT_TYPE } from './common/index.js'

export const app = fastify({
  logger: config.logger[process.env.NODE_ENV],
  ajv: {
    allowUnionTypes: true,
    removeAdditional: true, // remove additional properties
    useDefaults: true, // replace missing properties and items with the values from corresponding default keyword
    coerceTypes: true, // change data type of data to match type keyword
    nullable: true, // support keyword "nullable" from Open API 3 specification.
    customOptions: {
      strictTypes: false, // Disable strict type enforcement
      allowUnionTypes: true // Allow union types like JSONB
    }
  }
})

const onFile = async (part) => {
  const buff = await part.toBuffer()

  part.value = buff.toString('hex')
}

const opts = {
  ...config.upload,
  onFile
}

app.register(multipart, opts)

const tags = addSchemas(app)

app.register(Swagger, creteDefinition(tags, config))

app.register(SwaggerUI, {
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
})

app.setErrorHandler((error, _, reply) => {
  if (error.validation) {
    reply
      .header('Content-Type', PROBLEM_CONTENT_TYPE)
      .status(StatusCodes.BAD_REQUEST)
      .send(fastifyErrorToProblem(error.validation))

    return
  }

  reply.send(error)
})

/**
 * An attacker could search for valid URLs if your 404 error handling is not rate limited. To rate
 * limit your 404 response, you can use a custom handler
 */
app.setNotFoundHandler((_, reply) => {
  reply.code(StatusCodes.NOT_FOUND).send()
})

// TODO: Move it to its own domain.
app.get('/health-check', (_, reply) => {
  reply.code(StatusCodes.OK).send({
    status: 'pass',
    version: config.server.version.split('.')[0],
    releaseId: config.server.version,
    notes: [''],
    output: '',
    serviceId: randomUUID(),
    description: 'REST API Service Health'
  })
})

// Response compression
await app.register(fastifyCompress, config.compression)

// Security measures
await app.register(csrfProtection)
await app.register(helmet)
await app.register(cors)

// Domains Routes
for (const route of Object.values(routes)) {
  app.register(route)
}
