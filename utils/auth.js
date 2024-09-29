/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './db';
import redisClient from './redis';

export const getUserFromAuthorization = async (req) => {
  const authorization = req.headers.authorization || null;

  if (!authorization) {
    return null;
  }
  const authorizationParts = authorization.split(' ');

  if (authorizationParts.length !== 2 || authorizationParts[0] !== 'Basic') {
    return null;
  }
  const token = Buffer.from(authorizationParts[1], 'base64').toString();
  const delim = token.indexOf(':');
  const email = token.substring(0, delim);
  const password = token.substring(delim + 1);
  const usr = await (await dbClient.usersCollection()).findOne({ email });

  if (!usr || sha1(password) !== usr.password) {
    return null;
  }
  return usr;
};

export const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null;
  }
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return null;
  }
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  return user || null;
};

export default {
  getUserFromAuthorization: async (req) => getUserFromAuthorization(req),
  getUserFromXToken: async (req) => getUserFromXToken(req),
};
