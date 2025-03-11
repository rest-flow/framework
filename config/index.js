import { randomBytes } from 'node:crypto'

export const config = {
  application: {
    name: 'APP_NAME',
    description: 'APP_DESCRIPTION',
    version: '1.0.0'
  },
  upload: {
    limits: {
      fieldNameSize: 100, // max field name size
      fieldSize: 100, // max field value size
      fields: 50, // max number of fields
      fileSize: 1024 * 1024 * 5, // 5mb- max file size
      files: 10 // max number of files
    },
    attachFieldsToBody: 'keyValues',
  },
  authentication: {
    secret: process.env.TOKEN_SECRET ?? randomBytes(20).toString('hex'),
    expiresIn: Number.parseInt(process.env.EXPIRES_IN ?? 3600, 10)
  },
  server: {
    hostname: '::',
    port: Number.parseInt(process.env.PORT ?? 3000, 10),
    environment: process.env.NODE_ENV ?? 'development',
    version: '1.0.0'
  },
  database: {
    pagination: {
      limit: 50
    }
  },
  logger: {
    path: './logs'
  }
}
