export interface Movie {
  id: string;
  title: string;
  year?: number;
  cast?: string;
  poster?: string;
  imdbUrl?: string;
  rank?: number;
  timesWatched?: number;
}

export interface UserAccount {
  username: string;
  password: string;
}
