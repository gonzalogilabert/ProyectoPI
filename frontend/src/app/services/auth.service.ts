import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private router: Router) { }

    private hasToken(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    isLoggedInValue() {
        return this.loggedIn.value;
    }

    login(email: string, password: string): boolean {
        // Simulación: Acepta cualquier credencial por ahora
        // En el futuro, aquí iría la llamada al backend
        localStorage.setItem('auth_token', 'mock-jwt-token-123456');
        this.loggedIn.next(true);
        return true;
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
    }
}
