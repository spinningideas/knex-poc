import express, { Express, Request, Response } from "express";
import cors from "cors";
import { getKnexForDb } from "./Database";
import { continentRepository } from "./repositories/continentsRepository";
import { countryRepository } from "./repositories/countryRepository";

const app: Express = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "localhost";

// Setup app
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const knexInstanceForDb = getKnexForDb();

// Setup routes
//==continents=======================
app.get("/continents", async (req: Request, res: Response) => {
  const repo = continentRepository(knexInstanceForDb);
  return await repo.getByCriteria().then((continents) => {
    res.json(continents);
  });
});
//==countries==============================
app.get("/countries/:continentCode", async (req: Request, res: Response) => {
  let continentCode = req.params.continentCode;
  const repoCountries = countryRepository(knexInstanceForDb);
  return await repoCountries
    .getByCriteria({
      continentCode: continentCode,
    })
    .then((results) => {
      if (!results) {
        res.status(404).json({
          message: "countries not found with continentCode: " + continentCode,
        });
      } else {
        res.json(results);
      }
    });
});

app.get(
  "/countries/:continentCode/:pageNumber/:pageSize/:orderBy/:orderDesc",
  async (req: Request, res: Response) => {
    const { continentCode } = req.params;
    const { pageNumber } = req.params;
    const { pageSize } = req.params;
    //const { orderBy } = req.params;
    //const { orderDesc } = req.params;

    const repoCountries = countryRepository(knexInstanceForDb);

    const currentPageNumber = pageNumber as unknown as number;
    const currentPageSize = pageSize as unknown as number;

    return await repoCountries
      .getByCriteria(
        { continentCode: continentCode },
        undefined,
        undefined,
        currentPageNumber,
        currentPageSize
        //orderBy,
        // orderDesc
      )
      .then((results) => {
        if (!results) {
          res.status(404).json({
            message: "No countries found with continentCode: " + continentCode,
          });
        } else {
          res.json(results);
        }
      });
  }
);

app.get("/country/:countryCode", async (req: Request, res: Response) => {
  let countryCode = req.params.countryCode;
  const repoCountry = countryRepository(knexInstanceForDb);
  return await repoCountry
    .getSingleByCriteria({ countryCode: countryCode })
    .then((results) => {
      if (!results) {
        res.status(404).json({
          message: "country not found with countryCode: " + countryCode,
        });
      } else {
        res.json(results);
      }
    });
});

//==app start==============================
app.listen(PORT, () => {
  console.log(`Server running at ${HOST}:${PORT} `);
});
