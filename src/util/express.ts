import { RequestHandler, Request, Response, NextFunction } from 'express'

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncMiddleware = (fn: AsyncRequestHandler): RequestHandler =>
            (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export class NotFoundError extends Error {
  public status = 404
  constructor () {
    super('404 Not Found')
  }
}
