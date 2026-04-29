import { Injectable } from '@angular/core';
import { Movie, UserAccount } from '../models/film.models';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  private readonly USERS_KEY = 'filmlog_users';
  private readonly CURRENT_USER_KEY = 'filmlog_current_user';

  constructor() {}

  private getWatchlistKey(username: string): string {
    return `filmlog_watchlist_${username}`;
  }

  private getWatchedKey(username: string): string {
    return `filmlog_watched_${username}`;
  }

  async getUsers(): Promise<UserAccount[]> {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async saveUsers(users: UserAccount[]): Promise<void> {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  async getCurrentUser(): Promise<string | null> {
    return localStorage.getItem(this.CURRENT_USER_KEY) ?? null;
  }

  async setCurrentUser(username: string | null): Promise<void> {
    if (!username) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return;
    }
    localStorage.setItem(this.CURRENT_USER_KEY, username);
  }

  async getWatchlist(username: string): Promise<Movie[]> {
    const data = localStorage.getItem(this.getWatchlistKey(username));
    return data ? JSON.parse(data) : [];
  }

  async saveWatchlist(username: string, movies: Movie[]): Promise<void> {
    localStorage.setItem(this.getWatchlistKey(username), JSON.stringify(movies));
  }

  async getWatched(username: string): Promise<Movie[]> {
    const data = localStorage.getItem(this.getWatchedKey(username));
    return data ? JSON.parse(data) : [];
  }

  async saveWatched(username: string, movies: Movie[]): Promise<void> {
    localStorage.setItem(this.getWatchedKey(username), JSON.stringify(movies));
  }

  async addToWatchlist(username: string, movie: Movie): Promise<boolean> {
    const watchlist = await this.getWatchlist(username);
    const watched = await this.getWatched(username);

    if (watchlist.some((m) => m.id === movie.id) || watched.some((m) => m.id === movie.id)) {
      return false;
    }

    watchlist.unshift(movie);
    await this.saveWatchlist(username, watchlist);
    return true;
  }

  async removeFromWatchlist(username: string, movieId: string): Promise<void> {
    const watchlist = await this.getWatchlist(username);
    await this.saveWatchlist(
      username,
      watchlist.filter((movie) => movie.id !== movieId),
    );
  }

  async markAsWatched(username: string, movie: Movie): Promise<void> {
    const watchlist = await this.getWatchlist(username);
    const watched = await this.getWatched(username);

    const existingWatched = watched.find((m) => m.id === movie.id);
    if (existingWatched) {
      existingWatched.timesWatched = (existingWatched.timesWatched ?? 1) + 1;
    } else {
      watched.unshift({ ...movie, timesWatched: 1 });
    }

    await this.saveWatched(username, watched);
    await this.saveWatchlist(
      username,
      watchlist.filter((m) => m.id !== movie.id),
    );
  }

  async removeFromWatched(username: string, movieId: string): Promise<void> {
    const watched = await this.getWatched(username);
    await this.saveWatched(
      username,
      watched.filter((movie) => movie.id !== movieId),
    );
  }

  async resetWatchedToWatchlist(username: string, movieId: string): Promise<void> {
    const watched = await this.getWatched(username);
    const watchlist = await this.getWatchlist(username);

    const movie = watched.find((m) => m.id === movieId);
    if (!movie) {
      return;
    }

    const cleanedWatched = watched.filter((m) => m.id !== movieId);
    const alreadyInWatchlist = watchlist.some((m) => m.id === movieId);

    if (!alreadyInWatchlist) {
      watchlist.unshift({ ...movie, timesWatched: 0 });
    }

    await this.saveWatched(username, cleanedWatched);
    await this.saveWatchlist(username, watchlist);
  }

  async findMovieForUser(username: string, movieId: string): Promise<Movie | undefined> {
    const [watchlist, watched] = await Promise.all([
      this.getWatchlist(username),
      this.getWatched(username),
    ]);

    return [...watchlist, ...watched].find((movie) => movie.id === movieId);
  }
}
