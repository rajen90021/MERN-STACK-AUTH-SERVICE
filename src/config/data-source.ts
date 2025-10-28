import 'reflect-metadata'
import { DataSource } from 'typeorm'
import path from 'path'

import { Config } from '.'

const isCompiled = __dirname.includes('dist')

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST ?? 'localhost',
  port: Number(Config.DB_PORT ?? 5432),
  username: Config.DB_USERNAME ?? 'root',
  password: Config.DB_PASSWORD ?? 'root',
  database: Config.DB_NAME ?? 'merstack_auth_service_dev',
  //   dont use this in production always keep false
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '..', 'entity', '*.{ts,js}')],
  migrations: [path.join(__dirname, '..', 'migration', '*.{ts,js}')],
  subscribers: [],
})
