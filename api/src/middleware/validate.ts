import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
  };
};
