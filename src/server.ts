import app from './app'
import { Config } from './config'
import logger from './config/logger'

export const startServer = () => {
  const port = Config.PORT

  try {
    app.listen(port, () => {
      logger.info("app is listening",{port :port})
    })
  } catch (e) {
    console.log(e)
  }
}

startServer()
