import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CalendarModule } from 'angular-calendar';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FormsModule, ReactiveFormsModule,
     CommonModule, CalendarModule, FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Meet_And_Greet_FE';

  isLoggedIn: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.checkIfHeaderShouldBeDisplayed();
  }

  private checkIfHeaderShouldBeDisplayed() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url.includes('login') || this.router.url.includes('signup')) {
          this.isLoggedIn = false;
        } else {
          this.isLoggedIn = true;
        }
      }
    });

  }
}
