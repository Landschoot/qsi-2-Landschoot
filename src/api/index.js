import express from 'express';
import { apiUsers, apiUsersProtected } from './users';
import { isAuthenticated, initAuth } from '../business/auth';

const api = express();
initAuth();
api.use(express.json({ limit: '1mb' }));

const apiRoutes = express.Router();
apiRoutes
  .use('/users', apiUsers)
  // api bellow this middelware require Authorization
  .use(isAuthenticated)
  .use('/users', apiUsersProtected)
  .use((err, req, res, next) => {
    res.status(403).send({
      success: false,
      message: `${err.name} : ${err.message}`,
    });
    next();
  });

api.use('/api/v1', apiRoutes);
export default api;
