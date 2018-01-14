# Application Programming Interface

Modern applications use web API to communicate together. Web APIs point out a way to communicate through a protocol over a socket (http, websocket, protobuf) synchronously or asynchronously.

IT industry uses many standards or protocols : SOAP/XML, XML-RPC, RESTfull/JSON, REST-RPC/JSON, ...
The last one is the most used nowadays but there also emerging tehcnologies : Facebook GraphQL, Netflix Falcor or Google grpc.io are gaining adepts since few years

During this training we will learn to create a REST/Json API with Node.js, serialiaze data in a database, secure your API and deploy it on a PaaS provider.

## Specification :

Our project is to build a simple blog backend.

### User stories :

1. _As_ an anonymous user, _I want_ to create an account _so that_ I could login.
2. _As_ an anonymous user, _I want_ to login _so that_ I could access authenticate actions.
3. _As_ an authenticate user, _I want_ to create a post _so that_ I could share news.
4. _As_ an authenticate user, _I want_ to modify, delete or publish a post _so that_ I could manage my own posts.
5. _As_ an anonymous user, _I want_ to get all published posts _so that_ I could list most recent posts.
6. _As_ an anonymous user, _I want_ to get all infos of a specific published post _so that_ I could read a full post.

### Organize your application

Your code will be store in the following organization.

    |- src
        |- api : routing inteface files
        |- business : business code files
        |_ model : databse model files
    |_ __tests__ : store all unit tests

As in the previous training, we will use prettier, eslint, babel and jest. This project is already configured. Just install dependencies before starting :

```
npm i
```

### Create the signup / login API

_We will use REST-RPC approach and JSON for response and request format. In this approach will will use HTTP verbs to describe the action on ressources defined in URL. But counter Restfull we can also define procedure in url and will not make all responses cacheable._

0. Logging

Before we start we will use a professional logger : `console.log` or `console.error` are synchronous when the destination is a terminal or a file, so they are not suitable for production. To log our application we will use [winston](https://github.com/winstonjs/winston) lib.

Install winston rc3

```
npm i -S winston@next
```

Then we will define our logger in `src/logger.js` with a console transport :

```js
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;
const myFormat = printf(
  info => `${info.timestamp} ${info.level} : ${info.message}`
);

const logger = createLogger({
  level: process.env.LEVEL || 'info',
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
});

export default logger;
```

As you can see, we use an environnement variable `LEVEL` to define the logging level. For development this variable is define in a `.env`. We use the lib `env-cmd` to load this file for development (see [npm dev script](package.json#7)).

You can add other [transport](https://github.com/winstonjs/winston#transports) if you want.

1. Model

Your model will be store in PostgreSQL. To manage your development database :

* If you are using OSX, install [PostgresAPP](https://postgresapp.com/)
* If you are accurate with Docker, you can use [postgres container](https://hub.docker.com/_/postgres/)
* If you're using Ubuntu on your personnal computer, you can also [install postgreSQL](https://doc.ubuntu-fr.org/postgresql)
* You can also create a [free PaaS database](https://www.elephantsql.com/plans.html)

Then install [sequelize](http://docs.sequelizejs.com) the ORM we will use :

```
npm i -S pg@6 pg-hstore sequelize bcrypt
```

Read the user's model which is defined in `src/model/users.js`

Setup the path to database in the environnement variable `DATABASE_URL`in the file `.env`.

First time you will do `npm run dev` the database will be create (see [src/model/index.js](./src/model/index.js))

To manage your database, you should install [PgAdmin](https://www.pgadmin.org/download/)

2. Routing

We could define those routes :

Public

    POST   /api/v1/users/login "log a user"
    POST   /api/v1/users/  "create a user"

Authenticated

    GET    /api/v1/users/  "get info of logged user"
    PUT    /api/v1/users/  "modify info of logged user"
    DELETE /api/v1/users/  "delete the logged user"

To manage api, we will introduce [Express](http://expressjs.com/en/4x/api.html) which is a minimalist web framework.

```
npm i -S express
```

The main thing to understand with Express is the [middelware](http://expressjs.com/en/guide/using-middleware.html) composition.

To test your api, you should install [Insomnia](https://insomnia.rest/download/)

#### Setup your api

Edit [src/api/index.js](src/api/index.js) :

```js
import express from 'express';
// create an express Application for our api
const api = express();
// apply a middelware to parse application/json body
api.use(express.json({ limit: '1mb' }));
// create an express router that will be mount at the root of the api
const apiRoutes = express.Router();
apiRoutes.get('/', (req, res) =>
  res.status(200).send({ message: 'hello from my api' })
);

// root of our API will be http://localhost:5000/api/v1
api.use('/api/v1', apiRoutes);
export default api;
```

Edit [src/index.js](src/api/index.js) :

```js
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
```

Now you can start your API with `npm run dev` and test with `curl http://localhost:5000/api/v1`

#### Serve the public routes

api (sometime called route) aim is to expose routing and business (sometime called controller) to manage logic of the app.
Take a look at [src/api/users.js](src/api/users.js) and [business/api/users.js](src/api/users.js)

Edit [src/api/index.js](src/api/index.js) :

```js
import express from 'express';
import apiUsers from './users';

// create an express Application for our api
const api = express();
// apply a middelware to parse application/json body
api.use(express.json({ limit: '1mb' }));
// create an express router that will be mount at the root of the api
const apiRoutes = express.Router();
// connect api users router
apiRoutes.use('/users', apiUsers);

apiRoutes.get('/', (req, res) =>
  res.status(200).send({ message: 'hello from my api' })
);

// root of our API will be http://localhost:5000/api/v1
api.use('/api/v1', apiRoutes);
export default api;
```

3. Manage Authentication

We will use [Passport](http://www.passportjs.org/docs/downloads/html/) an authentication middleware for Node.js. Passport can be unobtrusively dropped in to any Express-based web application.

You probably notice we generate [JWT Token](https://jwt.io/introduction/) when we login a user. We will use it to manage Authentication, passing the token through the Authorization header when calling a protected route.

Install :

```
npm i -S passport passport-jwt
```

Edit `business/auth.js` :

```js
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { getUser } from '../business/users';

// Create our strategy
function jwtStrategy(opts) {
  return new JWTStrategy(opts, (jwtPayload, done) =>
    getUser(jwtPayload)
      .then(user => {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
        return null;
      })
      .catch(err => done(err, false))
  );
}

// Init passport with our jwt strategy
export function initAuth() {
  const opts = {};
  opts.secretOrKey = process.env.JWT_SECRET;
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  passport.use(jwtStrategy(opts));
}

// Create a middleware to check authentication
export function isAuthenticated(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('UNAUTHORIZED USER'));
    }
    req.user = user;
    return next();
  })(req, res, next);
}
```

Then edit `api/index.js`:

```js
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
```

## Exercices

1. Develop remaining Users API

2. Develop Posts model, API & business to fulfill the user stories

   A Post have :

   * Title
   * Short Text
   * Full Text
   * Metadatas (use a JSON Column)

   A Post has one writer (a User) and a User belongs to many Posts

3. Secure you api

Install `hpp` and `helmet` npm libs and setup the middlewares.

4. Deploy your application to Heroku

* Create an account on [heroku](https://www.heroku.com)
* Create a free dynos with a free postgresql addon
* Setup your environment variables
* Add a heroku remote to your Git
* Git push your application