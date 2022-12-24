import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("continent", (table) => {
    table.uuid("continent_id").primary();
    table.specificType("continent_code", "CHAR(2)").notNullable();
    table.specificType("continent_name", "VARCHAR(50)").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("continent");
}
