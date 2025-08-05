import type { Knex } from 'knex';
import path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database/audit_system.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database/audit_system.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    }
  }
};

export default config;