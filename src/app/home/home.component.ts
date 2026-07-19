import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  dropdownOpened = signal<boolean>(false);

  surveyService = inject(SurveyService);

  constructor() {}

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
