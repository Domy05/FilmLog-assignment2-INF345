import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Movie as MovieModel } from '../models/film.models';

interface ImdbMovieResponse {
  description?: ImdbMovieItem[];
}

interface ImdbMovieItem {
  '#IMDB_ID'?: string;
  '#TITLE'?: string;
  '#YEAR'?: number;
  '#ACTORS'?: string;
  '#IMG_POSTER'?: string;
  '#IMDB_URL'?: string;
  '#RANK'?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Movie {
  private readonly API_BASE = 'https://imdb.iamidiotareyoutoo.com/search?q=';
  private selectedMovie: MovieModel | null = null;

  constructor(private http: HttpClient) {}

  searchMovies(query: string): Observable<MovieModel[]> {
    return this.http.get<ImdbMovieResponse>(`${this.API_BASE}${encodeURIComponent(query)}`).pipe(
      map((response) => {
        const items = response?.description ?? [];
        return items
          .filter((item) => item['#IMDB_ID'] && item['#TITLE'])
          .map((item) => this.mapImdbMovie(item));
      }),
    );
  }

  setSelectedMovie(movie: MovieModel): void {
    this.selectedMovie = movie;
  }

  getSelectedMovie(): MovieModel | null {
    return this.selectedMovie;
  }

  private mapImdbMovie(item: ImdbMovieItem): MovieModel {
    return {
      id: item['#IMDB_ID'] as string,
      title: item['#TITLE'] as string,
      year: item['#YEAR'],
      cast: item['#ACTORS'] ?? 'Cast information unavailable',
      poster: item['#IMG_POSTER'] ?? '',
      imdbUrl: item['#IMDB_URL'] ?? '',
      rank: item['#RANK'],
      timesWatched: 0,
    };
  }
}
