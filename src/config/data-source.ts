import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { Config } from '.'
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST ?? 'localhost',
  port: Number(Config.DB_PORT ?? 5432),
  username: Config.DB_USERNAME ?? 'root',
  password: Config.DB_PASSWORD ?? 'root',
  database: Config.DB_NAME ?? 'merstack_auth_service_test',
  //   dont use this in production
  synchronize: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})
