// configuring our connection (pg is lib for the db):
const Pool = require("pg").Pool;
require("dotenv").config();

// Connecting our DB and server:

// Defining how & where we will be connecting to the DB:
const pool = new Pool({
    user: process.env.dbUser,
    password: process.env.dbPwd,
    host: process.env.dbHost,
    port: process.env.dbPort,
    database: process.env.dbName
});

// connecting the server to a specific DB:
module.exports = pool;
