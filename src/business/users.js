import _ from 'lodash'; // https://lodash.com/docs/
import { Users } from '../model';
import { debug } from 'util';

/**
 * Allows to create a user
 */
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

/**
 * Allows to connect a user
 */
export function loginUser({ email, password }) {
  return Users.findOne({
    where: {
      email,
    },
  })
    .then(
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
    )
    .then(users => users[0]);
}

/**
 * Allows to find a user
 */
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

/**
 * Allows to modify a user
 */
export function updateUser({ id }, { firstName, lastName, password }) {
  return Users.update(
    {
      firstName: firstName || '',
      lastName: lastName || '',
      hash: password,
    },
    {
      where: {
        id,
      },
      returning: true,
      plain: true,
    }
  ).then(users => {
    const user = users[1];
    user && !user.deletedAt
      ? _.omit(
          user.get({
            plain: true,
          }),
          Users.excludeAttributes
        )
      : Promise.reject(new Error('UNKOWN OR DELETED USER'));
  });
}

/**
 * Allows to delete a user
 */
export function deleteUser({ id }) {
  return Users.destroy({
    where: {
      id,
    },
  });
}
