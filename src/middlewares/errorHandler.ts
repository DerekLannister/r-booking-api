import { Request, Response, NextFunction } from 'express';
import { CustomError, ValidationError, BusinessLogicError, DatabaseError, NotFoundError } from '../utils/errors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof BusinessLogicError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({ error: 'An error occurred with the database' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;