const mysql = require("mysql2")
require("dotenv").config()

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Get connection from pool
const getConnection = () => {
  return pool.promise()
}

module.exports = { getConnection }
