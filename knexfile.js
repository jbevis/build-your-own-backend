// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres:localhost/seismology',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true
  },

  testing: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/seismology_test',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/test'
    },
    useNullAsDefault: true
  }
};
