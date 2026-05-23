import app from "./app";
import config from "./config";
import pool from "./config/database";

async function main() {
  try {
    // Check Database connection
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
  }
}

main();
