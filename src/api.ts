export type LibraryApiState = { books: unknown[]; members: unknown[]; activity?: unknown[] };
const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export function isApiConfigured(): boolean {
  return Boolean(apiBase);
}

export async function fetchLibraryState(): Promise<LibraryApiState | null> {
  if (!apiBase) return null;
  const response = await fetch(`${apiBase}/api/state`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Library API returned ${response.status}`);
  return response.json() as Promise<LibraryApiState>;
}

export async function saveLibraryState(state: LibraryApiState): Promise<void> {
  if (!apiBase) return;
  const response = await fetch(`${apiBase}/api/state`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error(`Could not save to Library API (${response.status})`);
}

export async function checkLibraryApi(): Promise<boolean> {
  if (!apiBase) return false;
  try {
    const response = await fetch(`${apiBase}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
