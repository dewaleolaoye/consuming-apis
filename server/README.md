# Todo Server

Express CRUD API for todos using PostgreSQL.

## Database

Create a PostgreSQL database named `todos`:

```sql
CREATE DATABASE todos;
```

The API creates the `todos` table automatically when the server starts.

## Setup

```sh
npm install
cp .env.example .env
npm run dev
```

Update `.env` if your local PostgreSQL user, password, host, or port differs.

## Endpoints

- `GET /todos`
- `GET /todos/:id`
- `POST /todos`
- `PUT /todos/:id`
- `PATCH /todos/:id`
- `DELETE /todos/:id`

Example request body:

```json
{
  "title": "Buy milk",
  "description": "Pick up oat milk",
  "completed": false
}
```
