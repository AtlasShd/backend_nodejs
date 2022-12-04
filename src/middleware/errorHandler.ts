import { Express, Request, Response, NextFunction } from 'express';

import ApiError from '../error/ApiError.js';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
};

export default errorHandler;