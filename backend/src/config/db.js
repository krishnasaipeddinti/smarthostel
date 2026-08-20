const { Pool } = require("pg");

const isSupabase =
  process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase.co");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("PostgreSQL connection error:", err.message);
  } else {
    console.log("PostgreSQL connected to Supabase successfully ✅");
    release();
  }
});

module.exports = pool;