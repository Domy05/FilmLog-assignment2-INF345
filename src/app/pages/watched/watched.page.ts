import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Storage } from '../../services/storage';
import { Movie as MovieModel } from '../../models/film.models';

@Component({
  selector: 'app-watched',
  templateUrl: './watched.page.html',
  styleUrls: ['./watched.page.scss'],
  standalone: false,
})
export class WatchedPage implements OnInit {
  movies: MovieModel[] = [];
  currentUser: string | null = null;

  constructor(
    private authService: Auth,
    private storageService: Storage,
    private movieService: Movie,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUsername();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    await this.loadWatched();
  }

  //reloads list every time entered
  async ionViewWillEnter(): Promise<void> {
    await this.loadWatched();
  }

  openDetails(movie: MovieModel): void {
    this.movieService.setSelectedMovie(movie);
    this.router.navigate(['/movie-details', movie.id], { state: { movie } });
  }

  //removes from the list. its moved back to watchlist and watch count resets
  async remove(movieId: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    await this.storageService.removeFromWatched(this.currentUser, movieId);
    await this.loadWatched();
    await this.presentToast('Removed from watched list.');
  }

  async reset(movieId: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    await this.storageService.resetWatchedToWatchlist(this.currentUser, movieId);
    await this.loadWatched();
    await this.presentToast('Watch count reset and movie moved to watchlist.');
  }

  //this loads the list of watched movies
  private async loadWatched(): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    this.movies = await this.storageService.getWatched(this.currentUser);
  }

  //helper to show toast messages
  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1600,
      position: 'bottom',
    });
    await toast.present();
  }
}
