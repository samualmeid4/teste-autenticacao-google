import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-success',
  imports: [RouterLink],
  templateUrl: './success.html',
})
export class Success {
  readonly user = this.getUser();

  private getUser() {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as { username?: string; email?: string };
    } catch {
      return null;
    }
  }
}
