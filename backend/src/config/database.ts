import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database/audit_system.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../../database/migrations'),
    extension: 'ts'
  },
  seeds: {
    directory: path.join(__dirname, '../../database/seeds')
  }
});

export default db;