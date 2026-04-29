import { Injectable } from '@angular/core';
import { Movie, UserAccount } from '../models/film.models';

@Injectable({
  providedIn: 'root',
})
export class Storage {  //deals with saving and loading app data in local storage
  private readonly USERS_KEY = 'filmlog_users';
  private readonly CURRENT_USER_KEY = 'filmlog_current_user';

  //
  constructor() {}
  //helper meth. gets key for watchlist according to username
  private getWatchlistKey(username: string): string {
    return `filmlog_watchlist_${username}`;
  }

  //helper meth. gets key for watched list according to username
  private getWatchedKey(username: string): string {
    return `filmlog_watched_${username}`;
  }

  //gets list of users from LS or empty array if nothing found
  async getUsers(): Promise<UserAccount[]> {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  //saves user list to LS
  async saveUsers(users: UserAccount[]): Promise<void> {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  //gets currently logged in user from LS or null if none
  async getCurrentUser(): Promise<string | null> {
    return localStorage.getItem(this.CURRENT_USER_KEY) ?? null;
  }

  //sets current user in LS or removes it if null
  async setCurrentUser(username: string | null): Promise<void> {
    if (!username) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return;
    }
    localStorage.setItem(this.CURRENT_USER_KEY, username);
  }

  //gets watchlist for user from LS or empty array if none
  async getWatchlist(username: string): Promise<Movie[]> {
    const data = localStorage.getItem(this.getWatchlistKey(username));
    return data ? JSON.parse(data) : [];
  }

  //saves watchlist for user to LS
  async saveWatchlist(username: string, movies: Movie[]): Promise<void> {
    localStorage.setItem(this.getWatchlistKey(username), JSON.stringify(movies));
  }

  //gets watched list for user from LS or empty array if none
  async getWatched(username: string): Promise<Movie[]> {
    const data = localStorage.getItem(this.getWatchedKey(username));
    return data ? JSON.parse(data) : [];
  }

  //saves watched list for user to LS
  async saveWatched(username: string, movies: Movie[]): Promise<void> {
    localStorage.setItem(this.getWatchedKey(username), JSON.stringify(movies));
  }

  //adds movie to watchlist if its not there already and not in watched. 
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

  //removes from watchlist
  async removeFromWatchlist(username: string, movieId: string): Promise<void> {
    const watchlist = await this.getWatchlist(username);
    await this.saveWatchlist(
      username,
      watchlist.filter((movie) => movie.id !== movieId),
    );
  }

  //takes from watchlist to watched. increases watch count if watched already
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

  //removes from watched list
  async removeFromWatched(username: string, movieId: string): Promise<void> {
    const watched = await this.getWatched(username);
    await this.saveWatched(
      username,
      watched.filter((movie) => movie.id !== movieId),
    );
  }

  //resets watch count and moves movie back to watchlist
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

  //finds movie in watch list and watched list for user by id
  async findMovieForUser(username: string, movieId: string): Promise<Movie | undefined> {
    const [watchlist, watched] = await Promise.all([
      this.getWatchlist(username),
      this.getWatched(username),
    ]);

    return [...watchlist, ...watched].find((movie) => movie.id === movieId);
  }
}
