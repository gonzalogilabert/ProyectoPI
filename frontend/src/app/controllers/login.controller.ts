import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

@Injectable()
export class LoginController {
    email = '';
    password = '';
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertService: AlertService
    ) { }

    onSubmit() {
        if (!this.email || !this.password) {
            this.alertService.error('Por favor, completa todos los campos');
            return;
        }

        this.isLoading = true;

        // Simulating network delay for realism (as requested for now)
        setTimeout(() => {
            const success = this.authService.login(this.email, this.password);

            if (success) {
                this.router.navigate(['/list']);
            } else {
                this.alertService.error('Credenciales incorrectas');
                this.isLoading = false;
            }
        }, 800);
    }
}
