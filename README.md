# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions. This is the backend API handling users and issues.

## Live URL

[https://devpulse-api-omega.vercel.app](https://devpulse-api-omega.vercel.app)

## Features

- User authentication and authorization (JWT)
- Role Based Access Control (Contributor, Maintainer)
- Endpoints to create, read, update, delete issues (bug or feature_request)

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL** (native `pg` driver)
- **bcrypt** / **jsonwebtoken**
- **tsup** for building
- **Vercel** for deployment

## Database Schema Summary

**Table `users`**

- `id` SERIAL PRIMARY KEY
- `name` VARCHAR(150) NOT NULL
- `email` VARCHAR(150) UNIQUE NOT NULL
- `password` VARCHAR(255) NOT NULL
- `role` VARCHAR(20) DEFAULT 'contributor'
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

**Table `issues`**

- `id` SERIAL PRIMARY KEY
- `title` VARCHAR(150) NOT NULL
- `description` TEXT NOT NULL
- `type` VARCHAR(50) NOT NULL (bug / feature_request)
- `status` VARCHAR(50) DEFAULT 'open' (open / in_progress / resolved)
- `reporter_id` INTEGER NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

## Setup Steps

1. Clone the repository

```bash
git clone <repository_url>
```

2. Copy `.env.example` to `.env` and configure your database URL and other variables.

3. Install dependencies:

```bash
npm install
```

4. Run the initialization script to create the necessary database tables:

```bash
node init_db.js
```

5. Start the development server:

```bash
npm run dev
```

## API Endpoint List

### Auth Module

- **POST** `/api/auth/signup` - Register a new user
- **POST** `/api/auth/login` - User login

### Issues Module

- **POST** `/api/issues` - Create an issue (Requires Contributor/Maintainer token)
- **GET** `/api/issues` - Get all issues (Filters: `sort`, `type`, `status`)
- **GET** `/api/issues/:id` - Get single issue
- **PATCH** `/api/issues/:id` - Update an issue (Requires Auth. Contributors can edit their open issues, Maintainers any issue)
- **DELETE** `/api/issues/:id` - Delete an issue (Requires Maintainer token)
