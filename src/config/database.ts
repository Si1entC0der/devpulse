import { Pool } from "pg";
import config from "./index";

const pool = new Pool({
  connectionString: config.database_url,
});

export default pool;
