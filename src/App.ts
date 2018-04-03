import * as express from 'express'
import * as logger from 'morgan'
import { json } from 'body-parser'
import { WebRouter } from './routes'

class App {
  private _express: express.Express

  constructor () {
    this._express = express()
    this.initMiddleware()
    this.initRoutes()
    this.initErrorHandlers()
  }

  private initErrorHandlers () {
    this.express.use((req, res, next) => {
      const err = new Error('404 Not Found')
      next(err)
    })

    this.express.use(((err, req, res, next) => {
      const dev = this.express.get('env') === 'development'
      res.status(err.status || 500)
         .json({ message: err.message
               , error: dev ? err.stack : ''
               , status: err.status })
    }) as express.ErrorRequestHandler)
  }

  private initMiddleware () {
    this.express.use(logger('dev'))
    this.express.use(json())
  }

  private initRoutes () {
    this.express.use('/web', WebRouter)
    // this.express.use('/game', GameRouter)
  }

  get express () {
    return this._express
  }
}

export default App
