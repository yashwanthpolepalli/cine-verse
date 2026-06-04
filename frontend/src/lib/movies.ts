import silentHorizon from "@/assets/poster-silent-horizon.jpg";
import midnightProtocol from "@/assets/poster-midnight-protocol.jpg";
import cloudKingdom from "@/assets/poster-cloud-kingdom.jpg";
import velvetAlley from "@/assets/poster-velvet-alley.jpg";
import lastEmpress from "@/assets/poster-last-empress.jpg";
import nightWalker from "@/assets/poster-night-walker.jpg";

export type Movie = {
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
  releaseNote?: string;
};

export const movies: Movie[] = [
  {
    id: "silent-horizon",
    title: "The Silent Horizon",
    genre: "Sci-Fi",
    rating: "PG-13",
    runtime: "2h 45m",
    imdb: 8.4,
    poster: silentHorizon,
    synopsis:
      "Stranded on the edge of a dying star system, a lone astronaut must broadcast a final message before the silence consumes everything.",
    cast: ["Eva Lin", "Marcus Hale", "Jiro Tanaka", "Ada Costa"],
    director: "Renee Okafor",
    status: "now",
  },
  {
    id: "midnight-protocol",
    title: "Midnight Protocol",
    genre: "Action",
    rating: "R",
    runtime: "1h 58m",
    imdb: 7.6,
    poster: midnightProtocol,
    synopsis:
      "A retired operative is pulled back into a city-wide conspiracy when an old code phrase resurfaces on the dark web.",
    cast: ["Diego Rivas", "Nora Aslan", "Tom Wexler"],
    director: "Aaron Voss",
    status: "now",
  },
  {
    id: "cloud-kingdom",
    title: "Cloud Kingdom",
    genre: "Animation",
    rating: "PG",
    runtime: "1h 42m",
    imdb: 7.9,
    poster: cloudKingdom,
    synopsis:
      "A timid mapmaker and a runaway princess race across floating islands to keep a kingdom from falling out of the sky.",
    cast: ["Mia Park", "Ben Ortega", "Luna Reyes"],
    director: "Studio Aurelia",
    status: "now",
  },
  {
    id: "velvet-alley",
    title: "Velvet Alley",
    genre: "Thriller",
    rating: "15",
    runtime: "1h 49m",
    imdb: 7.4,
    poster: velvetAlley,
    synopsis:
      "A jaded detective tracks a string of impossible thefts through the rain-soaked alleys of a city that never sleeps.",
    cast: ["Frank Vega", "Iris Holm", "Sade Akinyemi"],
    director: "Lior Bensimon",
    status: "now",
  },
  {
    id: "last-empress",
    title: "The Last Empress",
    genre: "Historical",
    rating: "PG-13",
    runtime: "2h 22m",
    imdb: 0,
    poster: lastEmpress,
    synopsis:
      "The intimate, sweeping story of a young empress holding a fracturing dynasty together through one impossible season.",
    cast: ["Mei Chen", "Hiro Saito", "Anya Vidal"],
    director: "Wen Liu",
    status: "upcoming",
    releaseNote: "Opening October 14 — pre-book opens Friday.",
  },
  {
    id: "night-walker",
    title: "The Night Walker",
    genre: "Horror",
    rating: "R",
    runtime: "1h 36m",
    imdb: 0,
    poster: nightWalker,
    synopsis:
      "Something walks the empty avenues after the last streetlight flickers. It has been waiting a very long time.",
    cast: ["Cole Mathers", "Ines Bauer"],
    director: "Anya Vidal",
    status: "upcoming",
    releaseNote: "Advance bookings open this Friday at midnight.",
  },
];

export const getMovie = (id: string) => movies.find((m) => m.id === id);

export const theatres = [
  { id: "scotiabank", name: "Scotiabank Theatre", distance: "1.2 km" },
  { id: "varsity", name: "Varsity Cinemas", distance: "2.8 km" },
  { id: "tiff", name: "TIFF Lightbox", distance: "3.5 km" },
];

export const showtimes = ["11:45 AM", "2:20 PM", "5:00 PM", "7:45 PM", "10:30 PM"];

export const seatPrice = 16.25;
