import _ from 'lodash'; // https://lodash.com/docs/
import { Users } from '../model';

export function createUser({ firstName, lastName, email, password }) {
  return Users.create({
    email,
    firstName: firstName || '',
    lastName: lastName || '',
    hash: password,
  }).then(user =>
    _.omit(
      user.get({
        plain: true,
      }),
      Users.excludeAttributes
    )
  );
}

export function loginUser({ email, password }) {
  return Users.findOne({
    where: {
      email,
    },
  }).then(
    user =>
      user && !user.deletedAt
        ? Promise.all([
            _.omit(
              user.get({
                plain: true,
              }),
              Users.excludeAttributes
            ),
            user.comparePassword(password),
          ])
        : Promise.reject(new Error('UNKOWN OR DELETED USER'))
  );
}

export function getUser({ id }) {
  return Users.findOne({
    where: {
      id,
    },
  }).then(
    user =>
      user && !user.deletedAt
        ? _.omit(
            user.get({
              plain: true,
            }),
            Users.excludeAttributes
          )
        : Promise.reject(new Error('UNKOWN OR DELETED USER'))
  );
}
