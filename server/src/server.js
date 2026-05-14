const cors = require("cors");
const express = require("express");
const { initDatabase, pool } = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/todos", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, description, completed, created_at, updated_at FROM todos ORDER BY id ASC"
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Todo id must be a positive integer." });
    }

    const { rows } = await pool.query(
      "SELECT id, title, description, completed, created_at, updated_at FROM todos WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/todos", async (req, res, next) => {
  try {
    const { title, description = null, completed = false } = req.body;

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Todo title is required." });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Todo completed value must be boolean." });
    }

    const { rows } = await pool.query(
      `INSERT INTO todos (title, description, completed)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title.trim(), description, completed]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description = null, completed = false } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Todo id must be a positive integer." });
    }

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Todo title is required." });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Todo completed value must be boolean." });
    }

    const { rows } = await pool.query(
      `UPDATE todos
       SET title = $1,
           description = $2,
           completed = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, title, description, completed, created_at, updated_at`,
      [title.trim(), description, completed, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch("/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description, completed } = req.body;
    const updates = [];
    const values = [];

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Todo id must be a positive integer." });
    }

    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return res.status(400).json({ error: "Todo title must be a non-empty string." });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({ error: "Todo completed value must be boolean." });
    }

    if (title !== undefined) {
      values.push(title.trim());
      updates.push(`title = $${values.length}`);
    }

    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (completed !== undefined) {
      values.push(completed);
      updates.push(`completed = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "At least one todo field is required." });
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE todos
       SET ${updates.join(", ")},
           updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, title, description, completed, created_at, updated_at`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Todo id must be a positive integer." });
    }

    const { rowCount } = await pool.query("DELETE FROM todos WHERE id = $1", [id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: "Todo not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Todo API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
