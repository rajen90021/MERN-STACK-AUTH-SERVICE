import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { Config } from '.'
import { RefreshToken } from '../entity/RefreshToken'
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
  entities: [User, RefreshToken],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
})
