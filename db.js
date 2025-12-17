// db.js
require('dotenv').config(); // Lädt die .env Variablen
const { Pool } = require('pg');

// Erstellt einen Pool von Verbindungen (besser für Performance)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Wir exportieren eine query-Funktion, die wir überall nutzen können
module.exports = {
  query: (text, params) => pool.query(text, params),
};