import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';
import { AppError } from './errorHandler';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError(`Validation error: ${messages.join('; ')}`, 400, 'VALIDATION_ERROR'));
    }
    // Replace with parsed/validated data (strips unknown fields)
    (req as any)[target] = result.data;
    next();
  };
}
