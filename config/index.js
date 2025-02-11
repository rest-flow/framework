import { randomBytes } from 'node:crypto'

export const config = {
  application: {
    name: 'AfterClass Rest API',
    description: 'AfterClass Rest API',
    version: '1.0.0'
  },
  authentication: {
    secret: process.env.TOKEN_SECRET ?? randomBytes(20).toString('hex'),
    expiresIn: Number(process.env.EXPIRES_IN ?? 3600)
  },
  server: {
    hostname: '::',
    port: process.env.PORT ?? 3000,
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
