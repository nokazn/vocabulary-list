import Knex, { PgConnectionConfig } from 'knex';

console.log(process.env.DB_PORT);

const connection: PgConnectionConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
};

const knex = Knex({
  client: 'postgres',
  version: '12',
  connection,
});

export default knex;
