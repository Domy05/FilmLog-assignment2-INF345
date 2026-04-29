import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Auth } from './services/auth';
import { Storage } from './services/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  tabs = [
    // { title: 'Login', route: '/login', icon: 'person-circle-outline' },
    { title: 'Home', route: '/home', icon: 'home-outline' },
    { title: 'Search', route: '/search', icon: 'search-outline' },
    { title: 'Watchlist', route: '/watchlist', icon: 'bookmark-outline' },
    { title: 'Watched', route: '/watched', icon: 'checkmark-circle-outline' },
  ];
  activeTab = '/login';
  isLoggedIn = false;

  constructor(private authService: Auth, private storageService: Storage, private router: Router) {
    this.setActiveTab(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.setActiveTab(event.urlAfterRedirects);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.storageService.init();
    this.isLoggedIn = await this.authService.isAuthenticated();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(async () => {
      this.isLoggedIn = await this.authService.isAuthenticated();
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private setActiveTab(url: string): void {
    if (url.startsWith('/home')) {
      this.activeTab = '/home';
      return;
    }

    if (url.startsWith('/search') || url.startsWith('/movie-details')) {
      this.activeTab = '/search';
      return;
    }

    if (url.startsWith('/watchlist')) {
      this.activeTab = '/watchlist';
      return;
    }

    if (url.startsWith('/watched')) {
      this.activeTab = '/watched';
      return;
    }

    this.activeTab = '/login';
  }
}
