import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RoomListComponent } from "../room-list/room-list.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RoomListComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  protected menuValue: boolean = false;
  protected menuIcon: string = "bi bi-list";
  protected currentTab: string = 'home';
  protected username: string | null = '';

  constructor(private router: Router, private authService: AuthService)
  {
    this.loadUserDetails();
    this.setCurrentTab();
  }

  public ngOnInit(): void {
    this.initialize();
  }

  protected openMenu(): void {
    this.menuValue = !this.menuValue;
  }

  protected closeMenu(): void {
    this.menuValue = false;
  }

  protected navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }

  protected setCurrentTab(): void {
    const url: string = this.router.url;
    if (url.includes('home')) {
      this.currentTab = 'home';
      return;
    }

    if (url.includes('booking')) {
      this.currentTab = 'booking';
    }
  }

  protected isActive(tab: string): boolean {
    return this.currentTab === tab;
  }
  private loadUserDetails(): void {
    this.username = this.authService.getUsername();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private initialize(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setCurrentTab();
    });
  }
}
