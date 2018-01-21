import express from 'express';
import { apiUsers, apiUsersProtected } from './users';
import { isAuthenticated, initAuth } from '../business/auth';
import helmet from 'helmet';
import hpp from 'hpp';

const api = express();
initAuth();
api.use(express.json({ limit: '1mb' }));

// secure api
api.use(helmet());
api.use(hpp());

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
