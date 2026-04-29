import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Storage } from '../../services/storage';
import { Movie as MovieModel } from '../../models/film.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  randomMovies: MovieModel[] = [];
  isLoading = false;
  errorMessage = '';
  currentUser: string | null = null;
  private destroy$ = new Subject<void>();

  //pre searched terms to get random movies to show
  private searchTerms = ['dogs', 'hero', 'action', 'anime', 'comedy', 'thriller','cats', 'cars', 'kdrama', 'super', 'romance', 'minecraft'];

  constructor(
    private movieService: Movie,
    private authService: Auth,
    private storageService: Storage,
    private router: Router,
    private toastController: ToastController,
  ) {}

  //checks if user logged in. takes user to login page if not. loads random movies
  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUsername();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.loadRandomMovies();
  }

  //reloads random movies every time entered
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  loadRandomMovies(): void {
    const randomTerm = this.searchTerms[Math.floor(Math.random() * this.searchTerms.length)];
    this.isLoading = true;
    this.errorMessage = '';

    this.movieService.searchMovies(randomTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (movies) => {
          this.randomMovies = movies.slice(0, 12);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Could not load random movies. Please try again.';
          this.isLoading = false;
        },
      });
  }

  openDetails(movie: MovieModel): void {
    this.movieService.setSelectedMovie(movie);
    this.router.navigate(['/movie-details', movie.id], { state: { movie } });
  }

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
      duration: 900,
      position: 'bottom',
    });
    await toast.present();
  }
}
