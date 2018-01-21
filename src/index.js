import api from './api';
import db from './model';
import logger from './logger';

const port = process.env.PORT || 5000;

// connect to database
db.sequelize
  .sync()
  .then(() =>
    // start the api
    api.listen(
      port,
      err =>
        err
          ? logger.error(`🔥  Failed to start API : ${err.stack}`)
          : logger.info(`🌎  API is listening on port ${port}`)
    )
  )
  .catch(err => logger.error(`🔥  Failed to connect database : ${err.stack}`));
