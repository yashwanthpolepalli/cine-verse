const getApiBase = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `${window.location.protocol}//${hostname}:8000/api`;
  }
  return (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api";
};
const API_BASE = getApiBase();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Movie types ────────────────────────────────────────
export type MovieAPI = {
  id: string;
  title: string;
  genre: string;
  rating: string;
  runtime: string;
  imdb: number;
  poster: string;
  synopsis: string;
  cast: string[];
  director: string;
  status: "now" | "upcoming";
  release_note?: string | null;
  language: string;
};

export type TheatreAPI = {
  id: string;
  name: string;
  distance: string;
  city: string;
  district?: string | null;
  state: string;
};

export type LocationAPI = {
  name: string;
  type: "city" | "district";
  state: string;
  parent_city?: string | null;
};

export type DateAPI = {
  label: string;
  date: string;
};

export type SeatAPI = {
  id: number;
  row: string;
  col: number;
  status: "available" | "sold" | "reserved";
};

export type SeatMapAPI = {
  rows: string[];
  cols: number;
  seats: SeatAPI[];
  seat_price: number;
  booking_fee: number;
};

export type TicketAPI = {
  id: string;
  movie_id: string;
  theatre_id: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  created_at: string;
};

export type UserAPI = {
  id: number;
  name: string;
  email: string;
  avatar_initials: string;
  films_watched: number;
  hours: number;
  reviews: number;
};

// ── Movies ─────────────────────────────────────────────
export async function fetchMovies(
  status?: "now" | "upcoming",
  city?: string,
  language?: string,
): Promise<MovieAPI[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (city) params.set("city", city);
  if (language) params.set("language", language);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const data = await request<{ movies: MovieAPI[] }>(`/movies${qs}`);
  return data.movies;
}

export async function fetchTrending(city?: string, limit = 5): Promise<MovieAPI[]> {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  params.set("limit", String(limit));
  const data = await request<{ movies: MovieAPI[] }>(`/movies/trending?${params}`);
  return data.movies;
}


export async function fetchFeaturedMovie(city?: string): Promise<MovieAPI> {
  const params = city ? `?city=${encodeURIComponent(city)}` : "";
  return request<MovieAPI>(`/movies/featured${params}`);
}

export async function fetchMovie(id: string): Promise<MovieAPI> {
  return request<MovieAPI>(`/movies/${id}`);
}

export async function searchMovies(q: string, genre: string, city?: string): Promise<MovieAPI[]> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre && genre !== "All") params.set("genre", genre);
  if (city) params.set("city", city);
  const data = await request<{ movies: MovieAPI[] }>(`/movies/search?${params}`);
  return data.movies;
}

// ── Theatres ───────────────────────────────────────────
export async function fetchTheatres(city?: string | Record<string, any>): Promise<TheatreAPI[]> {
  const actualCity = typeof city === "string" ? city : undefined;
  const params = actualCity ? `?city=${encodeURIComponent(actualCity)}` : "";
  return request<TheatreAPI[]>(`/theatres${params}`);
}

export async function fetchLocations(q?: string): Promise<LocationAPI[]> {
  const params = q ? `?q=${encodeURIComponent(q)}` : "";
  return request<LocationAPI[]>(`/theatres/locations/search${params}`);
}


// ── Showtimes ──────────────────────────────────────────
export async function fetchShowtimes(
  movieId: string,
  theatreId: string,
  date: string,
): Promise<string[]> {
  const params = new URLSearchParams({ movie_id: movieId, theatre_id: theatreId, date });
  return request<string[]>(`/showtimes?${params}`);
}

export async function fetchDates(movieId: string, city?: string): Promise<DateAPI[]> {
  const params = new URLSearchParams({ movie_id: movieId });
  if (city) params.set("city", city);
  return request<DateAPI[]>(`/showtimes/dates?${params}`);
}

export async function fetchTheatresForMovie(movieId: string, city?: string): Promise<string[]> {
  const params = new URLSearchParams({ movie_id: movieId });
  if (city) params.set("city", city);
  return request<string[]>(`/showtimes/theatres?${params}`);
}

// ── Seats ──────────────────────────────────────────────
export async function fetchSeatMap(
  movieId: string,
  theatreId: string,
  date: string,
  time: string,
): Promise<SeatMapAPI> {
  const params = new URLSearchParams({ theatre_id: theatreId, date, time });
  try {
    return await request<SeatMapAPI>(`/seats/${movieId}?${params}`);
  } catch (error) {
    console.warn("fetchSeatMap failed, using dynamic local fallback data:", error);
    // Generate a fallback seat map based on theatre category
    let rowsCount = 8;
    let colsCount = 10;
    let price = 250.0;
    let fee = 30.0;
    const nameLower = theatreId.toLowerCase();
    if (
      nameLower.includes("amb") ||
      nameLower.includes("pvr") ||
      nameLower.includes("cinepolis") ||
      nameLower.includes("inox") ||
      nameLower.includes("multiplex") ||
      nameLower.includes("sathyam")
    ) {
      rowsCount = 10;
      colsCount = 12;
      price = 350.0;
      fee = 45.0;
    } else if (
      nameLower.includes("swagath") ||
      nameLower.includes("sree") ||
      nameLower.includes("geeta") ||
      nameLower.includes("bhavya") ||
      nameLower.includes("rex") ||
      nameLower.includes("rohini") ||
      nameLower.includes("apsrtc")
    ) {
      rowsCount = 6;
      colsCount = 8;
      price = 150.0;
      fee = 15.0;
    }

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"].slice(0, rowsCount);

    // Seed seats status deterministically
    const seats: SeatAPI[] = [];
    let idCounter = 1;
    for (const r of rows) {
      for (let c = 1; c <= colsCount; c++) {
        const charSum = r.charCodeAt(0) + c + time.charCodeAt(0);
        const status: "available" | "sold" = (charSum % 100) < 20 ? "sold" : "available";
        seats.push({
          id: idCounter++,
          row: r,
          col: c,
          status,
        });
      }
    }

    return {
      rows,
      cols: colsCount,
      seats,
      seat_price: price,
      booking_fee: fee,
    };
  }
}

// ── Tickets ────────────────────────────────────────────
export async function fetchTickets(): Promise<TicketAPI[]> {
  try {
    const remote = await request<TicketAPI[]>("/tickets");
    const local = JSON.parse(
      (typeof window !== "undefined" && localStorage.getItem("local_tickets")) || "[]"
    );
    const merged = [...remote];
    for (const t of local) {
      if (!merged.some((m) => m.id === t.id)) {
        merged.unshift(t); // show local first
      }
    }
    return merged;
  } catch (error) {
    console.warn("fetchTickets failed, using local storage tickets:", error);
    return JSON.parse(
      (typeof window !== "undefined" && localStorage.getItem("local_tickets")) || "[]"
    );
  }
}

export async function fetchTicket(id: string): Promise<TicketAPI> {
  try {
    return await request<TicketAPI>(`/tickets/${id}`);
  } catch (error) {
    console.warn("fetchTicket failed, looking in local storage:", error);
    const local = JSON.parse(
      (typeof window !== "undefined" && localStorage.getItem("local_tickets")) || "[]"
    );
    const ticket = local.find((t: TicketAPI) => t.id === id);
    if (ticket) return ticket;
    throw error;
  }
}

export async function createBooking(data: {
  movie_id: string;
  theatre_id: string;
  date: string;
  time: string;
  seats: string[];
}): Promise<TicketAPI> {
  try {
    return await request<TicketAPI>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn("createBooking failed, creating local fallback ticket:", error);
    // Determine dynamic price and fee based on theatre to compute total
    let price = 250.0;
    let fee = 30.0;
    const nameLower = data.theatre_id.toLowerCase();
    if (
      nameLower.includes("amb") ||
      nameLower.includes("pvr") ||
      nameLower.includes("cinepolis") ||
      nameLower.includes("inox") ||
      nameLower.includes("multiplex") ||
      nameLower.includes("sathyam")
    ) {
      price = 350.0;
      fee = 45.0;
    } else if (
      nameLower.includes("swagath") ||
      nameLower.includes("sree") ||
      nameLower.includes("geeta") ||
      nameLower.includes("bhavya") ||
      nameLower.includes("rex") ||
      nameLower.includes("rohini") ||
      nameLower.includes("apsrtc")
    ) {
      price = 150.0;
      fee = 15.0;
    }
    const total = data.seats.length * price + fee;
    const ticket: TicketAPI = {
      id: `LMR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      movie_id: data.movie_id,
      theatre_id: data.theatre_id,
      date: data.date,
      time: data.time,
      seats: data.seats,
      total,
      created_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_tickets");
      const tickets = saved ? JSON.parse(saved) : [];
      tickets.push(ticket);
      localStorage.setItem("local_tickets", JSON.stringify(tickets));
    }
    return ticket;
  }
}

// ── Users ──────────────────────────────────────────────
export async function fetchProfile(): Promise<UserAPI> {
  return request<UserAPI>("/users/profile");
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
  avatar_initials?: string;
}): Promise<UserAPI> {
  return request<UserAPI>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Notifications ──────────────────────────────────────
export async function subscribeNotification(movieId: string): Promise<void> {
  await request("/notifications", {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId }),
  });
}
