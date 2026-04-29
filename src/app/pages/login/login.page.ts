import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  mode: 'login' | 'signup' = 'login';
  username = '';
  password = '';
  confirmPassword = '';
  isSubmitting = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    if (await this.authService.isAuthenticated()) {
      await this.router.navigateByUrl('/search', { replaceUrl: true });
    }
  }

  async submit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    if (this.mode === 'signup' && this.password !== this.confirmPassword) {
      await this.presentToast('Passwords do not match.');
      return;
    }

    this.isSubmitting = true;
    const result =
      this.mode === 'login'
        ? await this.authService.login(this.username, this.password)
        : await this.authService.signUp(this.username, this.password);
    this.isSubmitting = false;

    await this.presentToast(result.message);
    if (result.ok) {
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
      position: 'bottom',
    });
    await toast.present();
  }
}
