export type Ticket = {
  id: string;
  movieId: string;
  time: string;
  theatreId: string;
  date: string;
  seats: string[];
  total: number;
  createdAt: number;
};

const KEY = "lumiere.tickets.v1";

function read(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Ticket[];
  } catch {
    return [];
  }
}

function write(list: Ticket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listTickets(): Ticket[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getTicket(id: string): Ticket | undefined {
  return read().find((t) => t.id === id);
}

export function addTicket(t: Omit<Ticket, "id" | "createdAt">): string {
  const id = `LMR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const ticket: Ticket = { ...t, id, createdAt: Date.now() };
  write([...read(), ticket]);
  return id;
}
