import { randomUUID } from 'node:crypto'

import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import csrfProtection from '@fastify/csrf-protection'
import fastify from 'fastify'
import fastifyCompress from '@fastify/compress'
import helmet from '@fastify/helmet'
import multipart/* , { ajvFilePlugin } */ from '@fastify/multipart'
import { StatusCodes } from 'http-status-codes'

import { config } from '../config/index.js'
import { creteDefinition } from './openapi/createDefinition.js'
import * as routes from './domains/routes.js'
import { addSchemas, fastifyErrorToProblem, PROBLEM_CONTENT_TYPE } from './common/index.js'

export const app = fastify({
  logger: config.logger[process.env.NODE_ENV],
  ajv: {
    // useDefaults: true,
    // coerceTypes: true,
    // $data: true,
    // extendRefs: true,
    removeAdditional: true, // remove additional properties
    useDefaults: true, // replace missing properties and items with the values from corresponding default keyword
    coerceTypes: true, // change data type of data to match type keyword
    nullable: true // support keyword "nullable" from Open API 3 specification.
    // customOptions: {
    //   removeAdditional: false
    // },
    // plugins: [ajvFilePlugin]
  }
})

async function onFile (part, parent) {
  const buff = await part.toBuffer()
  // const decoded = Buffer.from(buff.toString(), 'base64').toString()
  // part.value = decoded // set `part.value` to specify the request body value
  part.value = buff.toString('hex')
}

const opts = {
  limits: {
    fileSize: 1024 * 1024 * 5, // 5mb- max file size
    fieldNameSize: 100, // 100 bytes- max field name size
    fields: 10, // 10 files- max number of fields
    fieldSize: 100, // 100 bytes- max field value size
    files: 5 // 5 files- max number of files
  },
  // attachFieldsToBody: true
  // attachFieldsToBody: 'keyValues'
  attachFieldsToBody: 'keyValues',
  onFile
}

app.register(multipart, opts)

const tags = addSchemas(app)

app.register(Swagger, creteDefinition(tags, config))

app.register(SwaggerUI/* , {
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
} */)

app.setErrorHandler(function (error, _, reply) {
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

// const tags = addSchemas(app)

// app.register(Swagger, creteDefinition(tags, config))

// app.register(SwaggerUI, {
//   uiConfig: {
//     docExpansion: 'list',
//     deepLinking: false
//   }
// })

// Domains Routes
for (const route of Object.values(routes)) {
  app.register(route)
}
