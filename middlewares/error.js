/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Represents an error in this API.
 */
export class APIError extends Error {
  constructor(code, message) {
    super();
    this.code = code || 500;
    this.message = message;
  }
}

export const errorResponse = (error, req, res, next) => {
  const defaultMsg = `Failed to process ${req.url}`;

  if (error instanceof APIError) {
    res.status(error.code).json({ error: error.message || defaultMsg });
    return;
  }
  res.status(500).json({
    error: error ? err.message || error.toString() : defaultMsg,
  });
};
