import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'

export const startServer = async () => {
  const port = Config.PORT

  try {
    await AppDataSource.initialize();
    logger.info('database connected')
    console.log('database connected')
    app.listen(port, () => {
      logger.info('app is listening', { port: port })
      console.log(`app is listening on port ${port}`)
    })
  } catch (e) {
    console.log(e)
  }
}

startServer()
