import { Knex } from "knex";
import Continent from "models/Continent";
import { KnexRepository } from "./KnexRepository";


export type ContinentRepository = KnexRepository<
  Continent,
  Continent,
  Continent,
  Continent
>;

export function continentRepository(knex: Knex): ContinentRepository {
  return new KnexRepository<Continent, Continent, Continent, Continent>(knex, {
    tableName: "continent",
    idColumn: "continentId",
    defaultOrderBy: [
      {
        column: "continentId",
        order: "asc",
      },
    ],
    columnsToFetch: ["continentId", "continentCode", "continentName"],
    columnsForCreate: ["continentId", "continentCode", "continentName"],
    columnsForUpdate: ["continentCode", "continentName"],
    columnsForFilters: ["continentId", "continentCode", "continentName"],
  });
}
