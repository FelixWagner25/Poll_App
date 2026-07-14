import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  dropdownOpened = signal<boolean>(false);

  toggleDropdown() {
    switch (this.dropdownOpened()) {
      case true:
        this.dropdownOpened.set(false);
        break;
      default:
        this.dropdownOpened.set(true);
        break;
    }
  }
}
