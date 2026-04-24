// ── Types ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// ── API client ────────────────────────────────────────────────────────────────
const BASE = "http://localhost:3001";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTasks: () => request<Task[]>("/tasks"),

  createTask: (title: string) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  toggleTask: (id: string, completed: boolean) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    }),

  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
