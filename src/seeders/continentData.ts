import { Knex } from "knex";

const continentData = [
  {
    continent_id: "e21134c7-bfde-459a-8ac2-dcdecf5ae8ed",
    continent_code: "AF",
    continent_name: "Africa",
  },
  {
    continent_id: "8f767f57-2bf3-4586-9801-196304bb50df",
    continent_code: "AN",
    continent_name: "Antarctica",
  },
  {
    continent_id: "2fba2034-cf75-4d04-8a3f-43d71a54a66f",
    continent_code: "AS",
    continent_name: "Asia",
  },
  {
    continent_id: "c0114ffd-46bd-420a-b706-bf1b900f6fee",
    continent_code: "EU",
    continent_name: "Europe",
  },
  {
    continent_id: "c8ee8e53-92ef-43e8-92f6-858a4296a0f2",
    continent_code: "NA",
    continent_name: "North America",
  },
  {
    continent_id: "199d31d3-b6fb-4a7d-b5d6-889038079323",
    continent_code: "OC",
    continent_name: "Oceania",
  },
  {
    continent_id: "d4a2b1a0-1786-43d8-80ba-363d2f6892c2",
    continent_code: "SA",
    continent_name: "South America",
  },
];

export async function seed(knex: Knex): Promise<void> {
  console.log("Running seeding of continents");
  await knex("continent").truncate();
  await knex("continent").insert(continentData);
}
