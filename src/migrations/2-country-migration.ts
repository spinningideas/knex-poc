import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("country", (table) => {
    table.uuid("country_id").primary();
    table.specificType("country_name", "VARCHAR(100)").notNullable(); // unique: true,
    table.specificType("country_code", "CHAR(2)").notNullable();
    table.specificType("country_code3", "CHAR(3)").notNullable();
    table.specificType("capital", "VARCHAR(100)").nullable();
    table.specificType("continent_code", "CHAR(2)").notNullable();
    table.integer("area").nullable();
    table.integer("population").nullable();
    table.specificType("longitude", "DECIMAL(10, 6)").nullable();
    table.specificType("latitude", "DECIMAL(10, 6)").nullable();
    table.specificType("currency_code", "CHAR(3)").nullable();
    table.specificType("currency_name", "VARCHAR(50)").nullable();
    table.specificType("languages", "VARCHAR(255)").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("country");
}
