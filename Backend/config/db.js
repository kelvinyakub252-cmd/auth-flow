const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: +process.env.DB_PORT,
});

const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT DEFAULT 0,
    field VARCHAR(50) DEFAULT 'Backend',
    password VARCHAR(100) NOT NULL,
    reset_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
  try {
    await pool.query(createTableQuery);
    console.info("database connected");
  } catch (error) {
    console.error("Error connecting to DB: ", error);
  }
};

module.exports = { pool, initDB };
