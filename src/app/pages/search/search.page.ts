import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Storage } from '../../services/storage';
import { Movie as MovieModel } from '../../models/film.models';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit {
  query = '';
  results: MovieModel[] = [];
  isLoading = false;
  errorMessage = '';
  currentUser: string | null = null;

  constructor(
    private movieService: Movie,
    private authService: Auth,
    private storageService: Storage,
    private router: Router,
    private toastController: ToastController,
  ) {}

  //checks if user logged in. takes user to login page if not
  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUsername();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }
  }

  //searches for movies based on query
  search(): void {
    if (!this.query.trim()) {
      this.results = [];
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.movieService.searchMovies(this.query).subscribe({
      next: (movies) => {
        this.results = movies;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not fetch movies. Please try again.';
        this.isLoading = false;
      },
    });
  }

  //opens details
  openDetails(movie: MovieModel): void {
    this.movieService.setSelectedMovie(movie);
    this.router.navigate(['/movie-details', movie.id], { state: { movie } });
  }

  //adds to wathc list
  async addToWatchlist(movie: MovieModel): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    const added = await this.storageService.addToWatchlist(this.currentUser, movie);
    await this.presentToast(added ? 'Added to watchlist.' : 'Movie is already tracked.');
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1600,
      position: 'bottom',
    });
    await toast.present();
  }
}
