import { Knex, knex } from "knex";
import knexStringcase from "knex-stringcase";

// NOTE: this should come from .env file and NOT be hardcoded here
// this is a POC so credentials are stored here for convenience
export const config = {
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "knex_poc_user",
    password: "SET_VALID_PASSWORD",
    database: "knex_poc_db",
  },
  migrations: {
    tableName: "migrations",
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeders",
  },
} as Knex.Config;

const database = knexStringcase(config);

export function getKnexForDb(): Knex {
  return knex({ ...database });
}

export default database;
