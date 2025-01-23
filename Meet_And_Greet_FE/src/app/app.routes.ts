import { Routes } from '@angular/router';
import { RoomListComponent } from './components/room-list/room-list.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './security/auth.guard';
import { loginAuthGuard } from './security/login-auth.guard';
import { SignupComponent } from './components/signup/signup.component';
import { BookingOverviewComponent } from './components/booking-overview/booking-overview.component';
export const routes: Routes = [

    { path: 'login', component: LoginComponent, canActivate: [loginAuthGuard] },
    { path: 'home', component: RoomListComponent, canActivate: [authGuard] },
    { path: 'booking', component: BookingOverviewComponent, canActivate: [authGuard] },
    { path: 'signup', component: SignupComponent},
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
