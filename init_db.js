const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_K2I5CgpqwJZO@ep-fragrant-night-apj0zefx-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const query = `
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

pool
  .query(query)
  .then(() => {
    console.log("Tables created successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error creating tables", err);
    process.exit(1);
  });
