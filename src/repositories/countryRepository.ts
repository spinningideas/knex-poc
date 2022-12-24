import { Knex } from "knex";
import Country from "models/Country";
import { KnexRepository } from "./KnexRepository";

export type CountryFilters = {
  countryCode?: string;
  continentCode?: string;
};

export type CountryRepository = KnexRepository<
  Country,
  Country,
  Country,
  CountryFilters
>;

export function countryRepository(knex: Knex): CountryRepository {
  return new KnexRepository<Country, Country, Country, Country>(knex, {
    tableName: "country",
    idColumn: "countryId",
    defaultOrderBy: [
      {
        column: "countryName",
        order: "asc",
      },
    ],
    columnsToFetch: [
      "countryId",
      "countryCode",
      "countryCode3",
      "countryName",
      "capital",
      "continentCode",
      "area",
      "population",
      "latitude",
      "longitude",
      "currencyCode",
      "currencyName",
      "languages",
    ],
    columnsForCreate: [
      "countryId",
      "countryCode",
      "countryCode3",
      "countryName",
      "capital",
      "continentCode",
      "area",
      "population",
      "latitude",
      "longitude",
      "currencyCode",
      "currencyName",
      "languages",
    ],
    columnsForUpdate: [
      "countryCode",
      "countryCode3",
      "countryName",
      "capital",
      "continentCode",
      "area",
      "population",
      "latitude",
      "longitude",
      "currencyCode",
      "currencyName",
      "languages",
    ],
    columnsForFilters: ["countryCode", "continentCode"],
  });
}
