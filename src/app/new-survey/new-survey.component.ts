import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
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
