import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { Movie } from '../../services/movie';
import { Storage } from '../../services/storage';
import { Movie as MovieModel } from '../../models/film.models';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: false,
})
export class MovieDetailsPage implements OnInit {
  movie: MovieModel | null = null;
  currentUser: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: Movie,
    private storageService: Storage,
    private authService: Auth,
    private toastController: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUsername();
    if (!this.currentUser) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    const fromState = this.router.getCurrentNavigation()?.extras?.state?.['movie'] as
      | MovieModel
      | undefined;
    const fromService = this.movieService.getSelectedMovie();
    const movieId = this.route.snapshot.paramMap.get('id');

    this.movie = fromState ?? fromService;

    if (!this.movie && movieId) {
      this.movie = await this.storageService.findMovieForUser(this.currentUser, movieId) ?? null;
    }
  }

  async addToWatchlist(): Promise<void> {
    if (!this.currentUser || !this.movie) {
      return;
    }

    const added = await this.storageService.addToWatchlist(this.currentUser, this.movie);
    await this.presentToast(added ? 'Added to watchlist.' : 'Movie is already tracked.');
  }

  async markAsWatched(): Promise<void> {
    if (!this.currentUser || !this.movie) {
      return;
    }

    await this.storageService.markAsWatched(this.currentUser, this.movie);
    await this.presentToast('Moved to watched list.');
    await this.router.navigateByUrl('/watched');
  }

  goHome(): void {
    void this.router.navigateByUrl('/home');
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
