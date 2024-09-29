/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { getUserFromXToken, getUserFromAuthorization } from '../utils/auth';

export const basicAuthenticate = async (req, res, next) => {
  const usr = await getUserFromAuthorization(req);

  if (!usr) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = usr;
  next();
};

export const xTokenAuthenticate = async (req, res, next) => {
  const usr = await getUserFromXToken(req);

  if (!usr) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = usr;
  next();
};
