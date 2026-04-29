import { Injectable } from '@angular/core';
import { Storage } from './storage';
import { UserAccount } from '../models/film.models';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private storageService: Storage) {}

  async signUp(username: string, password: string): Promise<{ ok: boolean; message: string }> {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || !password) {
      return { ok: false, message: 'Provide a username and password.' };
    }

    const users = await this.storageService.getUsers();
    const exists = users.some((user) => user.username === trimmedUsername);
    if (exists) {
      return { ok: false, message: 'Account already exists. Please log in.' };
    }

    const newUser: UserAccount = { username: trimmedUsername, password };
    await this.storageService.saveUsers([...users, newUser]);
    await this.storageService.setCurrentUser(trimmedUsername);

    return { ok: true, message: 'Account created successfully.' };
  }


  async login(username: string, password: string): Promise<{ ok: boolean; message: string }> {
    const trimmedUsername = username.trim().toLowerCase();
    const users = await this.storageService.getUsers();

    const user = users.find(
      (account) => account.username === trimmedUsername && account.password === password,
    );

    if (!user) {
      return { ok: false, message: 'Invalid username or password.' };
    }

    await this.storageService.setCurrentUser(user.username);
    return { ok: true, message: 'Login successful.' };
  }

  //clears current user from LS when logging out
  //keeps watchlist and watched in LS tho
  async logout(): Promise<void> {
    await this.storageService.setCurrentUser(null);
  }

  async getCurrentUsername(): Promise<string | null> {
    return this.storageService.getCurrentUser();
  }

  async isAuthenticated(): Promise<boolean> {
    return (await this.getCurrentUsername()) !== null;
  }
}
