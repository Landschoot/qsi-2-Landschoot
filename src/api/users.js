import express from 'express';
import jwt from 'jwt-simple';
import { createUser, loginUser } from '../business/users';
import logger from '../logger';

export const apiUsers = express.Router();

// http://apidocjs.com/#params
/**
 * @api {POST} /users User account creation
 * @apiVersion 1.0.0
 * @apiName createUser
 * @apiGroup Users
 *
 * @apiParam {STRING} email Email of the User.
 * @apiParam {STRING} password  Password of the User.
 * @apiParam {STRING} [firstName] First name of the User.
 * @apiParam {STRING} [lastName] Last name of the User.
 *
 * @apiSuccess {BOOLEAN} success Success.
 * @apiSuccess {STRING} message Message.
 * @apiSuccess {STRING} token JWT token.
 * @apiSuccess {JSON} profile Profile informations about the User.
 */
apiUsers.post(
  '/',
  (req, res) =>
    !req.body.email || !req.body.password
      ? res.status(400).send({
          success: false,
          message: 'email and password are required',
        })
      : createUser(req.body)
          .then(user => {
            const token = jwt.encode({ id: user.id }, process.env.JWT_SECRET);
            return res.status(201).send({
              success: true,
              token: `JWT ${token}`,
              profile: user,
              message: 'user created',
            });
          })
          .catch(err => {
            logger.error(`💥 Failed to create user : ${err.stack}`);
            return res.status(500).send({
              success: false,
              message: `${err.name} : ${err.message}`,
            });
          })
);

/**
 * @api {POST} /users/login User login
 * @apiVersion 1.0.0
 * @apiName loginUser
 * @apiGroup Users
 *
 * @apiParam {STRING} email Email of the User.
 * @apiParam {STRING} password  Password of the User.
 *
 * @apiSuccess {BOOLEAN} success Success.
 * @apiSuccess {STRING} message Message.
 * @apiSuccess {STRING} token JWT token.
 * @apiSuccess {JSON} profile Profile informations about the User.
 */
apiUsers.post(
  '/login',
  (req, res) =>
    !req.body.email || !req.body.password
      ? res.status(400).send({
          success: false,
          message: 'email and password are required',
        })
      : loginUser(req.body)
          .then(user => {
            const token = jwt.encode({ id: user.id }, process.env.JWT_SECRET);
            return res.status(200).send({
              success: true,
              token: `JWT ${token}`,
              profile: user,
              message: 'user logged in',
            });
          })
          .catch(err => {
            logger.error(`💥 Failed to login user : ${err.stack}`);
            return res.status(500).send({
              success: false,
              message: `${err.name} : ${err.message}`,
            });
          })
);

export const apiUsersProtected = express.Router();
/**
 * @api {GET} /users/login User login
 * @apiVersion 1.0.0
 * @apiName getUser
 * @apiGroup Users
 *
 * @apiParam {STRING} email Email of the User.
 * @apiParam {STRING} password  Password of the User.
 *
 * @apiSuccess {BOOLEAN} success Success.
 * @apiSuccess {STRING} message Message.
 * @apiSuccess {STRING} token JWT token.
 * @apiSuccess {JSON} profile Profile informations about the User.
 */
apiUsersProtected.get('/', (req, res) =>
  res.status(200).send({
    success: true,
    profile: req.user,
    message: 'user logged in',
  })
);
