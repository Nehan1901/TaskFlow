const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "tasks.json");

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ── Persistence helpers ───────────────────────────────────────────────────────
function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /tasks — return all tasks sorted newest-first
app.get("/tasks", (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

// POST /tasks — create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const task = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const tasks = loadTasks();
  tasks.unshift(task); // newest first
  saveTasks(tasks);

  res.status(201).json(task);
});

// PATCH /tasks/:id — toggle completed or update title
app.patch("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { completed, title } = req.body;

  if (completed !== undefined) tasks[index].completed = Boolean(completed);
  if (title !== undefined && title.trim()) tasks[index].title = title.trim();

  saveTasks(tasks);
  res.json(tasks[index]);
});

// DELETE /tasks/:id — remove a task
app.delete("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== req.params.id);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: "Task not found" });
  }

  saveTasks(filtered);
  res.status(204).send();
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`TaskFlow API running → http://localhost:${PORT}`);
});
