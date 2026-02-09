import { Component } from '@angular/core';
import { LoginController } from '../../../controllers/login.controller';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [LoginController]
})
export class LoginComponent {
    constructor(public vm: LoginController) { }

    onSubmit() {
        this.vm.onSubmit();
    }
}
