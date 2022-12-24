# Knex JS Typescript ORM POC

The code in this repo demonstrates use of [knexjs](https://knexjs.org/) as an ORM using two tables with geography data sets (continents and countries).

This code uses the following libaries:

- [knexjs](https://knexjs.org/)
- [typescript](https://www.typescriptlang.org/)
- [express](https://expressjs.com/)
- [postgresql](https://www.postgresql.org/)

This code assumes usage of knexjs and requires postgresql (or any db knexjs supports) and typescript.

This proof of concept uses a repository to get data from database and uses [express](https://expressjs.com/).

## Get Started

To get started perform the following steps:

### 1) Install PostGreSQL for your Operating System (OS)

https://www.postgresql.org/download/

### 2) Create PostgreSQL database to use in this POC along with user that has permissions to modify and access the database

- After installing locally you should have database server and the code connects to db using information in ormconfig.ts file so you need to ensure this db and user exists before running the code
- Create an empty database named "knex_poc_db"
- Create a create an account named "knex_poc_user" in your postgres database server with full permissions to the database named "knex_poc_db" using the password in Database.ts (after changing the value SET_YOUR_PASSWORD to be your desired password)

Here are sql scripts to run:

NOTE: run one at a time in order, first create the db then select the db and run these queries IN the new database so that the user has proper permissions to create tables and insert data.

```
CREATE DATABASE knex_poc_db;

CREATE ROLE knex_poc_user LOGIN PASSWORD 'SET_YOUR_PASSWORD - the_secure_password_from_Database.ts';

GRANT CONNECT ON DATABASE knex_poc_db TO knex_poc_user;

GRANT ALL PRIVILEGES ON DATABASE knex_poc_db TO knex_poc_user;

GRANT ALL ON SCHEMA public TO knex_poc_user;
```


After installing locally you should have a knex_poc_db server - you will need to do these steps:
#### 2.1 Create an empty database named "knex_poc_db"

#### 2.2 enable access to the credentials from Database.ts (username: knex_poc_user)

### 3) Install npm packages

Install the required packages via standard command:

```npm install```

### 4) Create database schema using migrations

```npm run db:migrate```

This runs the migrations in the migrations folder. See more: https://knexjs.org/guide/migrations.html

### 5) Populate database with data using data seeding

```npm run db:seed```

This runs the data seeds in the seeders folder. See more: https://knexjs.org/guide/migrations.html#seed-files

### 6) run the application

The application is configured to use nodemon to monitor for file changes and you can run command to start the application using it. You will see console information with url and port.

```npm run start```

NOTE: You can also run and debug the application if using vscode via the launch.json profile and debugging capabilities: https://code.visualstudio.com/docs/editor/debugging

### 7) exercise the application via postman OR thunder client

#### 7.1 - Get a client

1) https://www.thunderclient.com/

2) https://www.getpostman.com - Download and install https://www.getpostman.com

#### 7.2 - Import "postman" collection and run requests

Use the client of your choice to run the requests to see api data and responses after importing the collection in the "postman" folder

### 8 - Inspiration and Read More

- https://github.com/Kequc/knex-stringcase
- https://github.com/knex/knex-repositories
- https://www.npmjs.com/package/knex-paginate
- https://github.com/bkonkle/node-knex-typescript-example
- https://github.com/spinningideas/resources/wiki/Repositories
````
