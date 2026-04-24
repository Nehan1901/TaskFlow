import { useState, useEffect, useCallback, useRef } from "react";
import { api, Task } from "./api";

type Filter = "all" | "active" | "done";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .getTasks()
      .then(setTasks)
      .catch(() => setError("Couldn't reach the server. Is it running?"))
      .finally(() => setLoading(false));
  }, []);

  // ── Add task ────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async () => {
    const title = input.trim();
    if (!title) return;
    setInput("");
    setError(null);
    try {
      const task = await api.createTask(title);
      setTasks((prev) => [task, ...prev]);
    } catch {
      setError("Failed to add task.");
      setInput(title); // restore so user doesn't lose their text
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (task: Task) => {
    setTogglingIds((s) => new Set(s).add(task.id));
    try {
      const updated = await api.toggleTask(task.id, !task.completed);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Failed to update task.");
    } finally {
      setTogglingIds((s) => {
        const next = new Set(s);
        next.delete(task.id);
        return next;
      });
    }
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete task.");
      setDeletingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // ── Filtered view ───────────────────────────────────────────────────────────
  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="shell">
      <div className="card">
        {/* Header */}
        <header className="card-header">
          <div className="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--accent)" />
              <path
                d="M8 14.5L12 18.5L20 10"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="brand">TaskFlow</h1>
            <p className="brand-sub">Stay in motion.</p>
          </div>
          <div className="stats">
            <span className="stat">
              <strong>{activeCount}</strong> left
            </span>
            <span className="stat-divider" />
            <span className="stat done-stat">
              <strong>{doneCount}</strong> done
            </span>
          </div>
        </header>

        {/* Input */}
        <div className="input-row">
          <input
            ref={inputRef}
            className="task-input"
            type="text"
            placeholder="What needs doing?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            aria-label="New task"
          />
          <button
            className="add-btn"
            onClick={handleAdd}
            disabled={!input.trim()}
            aria-label="Add task"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 3v12M3 9h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="filter-row" role="tablist" aria-label="Filter tasks">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task list */}
        <ul className="task-list" aria-live="polite" aria-label="Task list">
          {loading && (
            <li className="empty-state">
              <span className="spinner" aria-label="Loading…" />
            </li>
          )}

          {!loading && visible.length === 0 && (
            <li className="empty-state">
              <span className="empty-icon">
                {filter === "done" ? "🎉" : "✦"}
              </span>
              <p>
                {filter === "done"
                  ? "Nothing completed yet."
                  : filter === "active"
                  ? "All caught up!"
                  : "Add your first task above."}
              </p>
            </li>
          )}

          {visible.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? "is-done" : ""} ${
                deletingIds.has(task.id) ? "is-deleting" : ""
              }`}
            >
              <button
                className={`check-btn ${task.completed ? "checked" : ""} ${
                  togglingIds.has(task.id) ? "toggling" : ""
                }`}
                onClick={() => handleToggle(task)}
                aria-label={
                  task.completed ? "Mark incomplete" : "Mark complete"
                }
                aria-pressed={task.completed}
              >
                {task.completed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <span className="task-title">{task.title}</span>

              <time
                className="task-time"
                dateTime={task.createdAt}
                title={new Date(task.createdAt).toLocaleString()}
              >
                {formatRelative(task.createdAt)}
              </time>

              <button
                className="delete-btn"
                onClick={() => handleDelete(task.id)}
                disabled={deletingIds.has(task.id)}
                aria-label={`Delete "${task.title}"`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 3.5h10M5.5 3.5V2.5h3v1M5.5 6v5M8.5 6v5M3 3.5l.7 8h6.6l.7-8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        {tasks.length > 0 && doneCount > 0 && (
          <div className="card-footer">
            <button
              className="clear-btn"
              onClick={async () => {
                const completed = tasks.filter((t) => t.completed);
                await Promise.all(completed.map((t) => handleDelete(t.id)));
              }}
            >
              Clear completed ({doneCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
