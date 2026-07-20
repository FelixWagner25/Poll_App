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
  selectedCategory: string = '';

  surveyService = inject(SurveyService);

  constructor() {}

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(value: string): void {
    this.selectedCategory = value;
    this.toggleDropdown();
  }
}
