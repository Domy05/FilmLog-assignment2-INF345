import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Storage } from '../../services/storage';
import { Movie as MovieModel } from '../../models/film.models';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  styleUrls: ['./watchlist.page.scss'],
  standalone: false,
})
export class WatchlistPage implements OnInit {
  movies: MovieModel[] = [];
  currentUser: string | null = null;

  constructor(
    private authService: Auth,
    private storageService: Storage,
    private movieService: Movie,
    private router: Router,
    private toastController: ToastController,
  ) {}

  //checks if user logged in. loads watchlist. if not then takes person to login page
  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUsername();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    await this.loadWatchlist();
  }

  //reloads list every time entered
  async ionViewWillEnter(): Promise<void> {
    await this.loadWatchlist();
  }

  //to check its details
  openDetails(movie: MovieModel): void {
    this.movieService.setSelectedMovie(movie);
    this.router.navigate(['/movie-details', movie.id], { state: { movie } });
  }

  //removes from watchlist
  async remove(movieId: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    await this.storageService.removeFromWatchlist(this.currentUser, movieId);
    await this.loadWatchlist();
    await this.presentToast('Removed from watchlist.');
  }

  async markWatched(movie: MovieModel): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    await this.storageService.markAsWatched(this.currentUser, movie);
    await this.loadWatchlist();
    await this.presentToast('Moved to watched list.');
  }

  //resets watch count and moves movie back to watchlist
  private async loadWatchlist(): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    this.movies = await this.storageService.getWatchlist(this.currentUser);
  }

  //helper to show toast messages
  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
