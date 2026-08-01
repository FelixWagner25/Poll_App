import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Category } from '../shared/types/category';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  dropdownOpened = signal<boolean>(false);
  selectedCategory: Category = null;

  surveyService = inject(SurveyService);

  constructor() {}

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(value: Category): void {
    this.selectedCategory = value;
    this.toggleDropdown();
  }

  getRemainingDaysString(endDate: string): string {
    if (endDate == '') return 'Active';
    const endDateObj = new Date(endDate);
    const today = new Date();
    const diffInMs = endDateObj.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) {
      return 'Ended';
    } else if (diffInDays == 0) {
      return 'Ends today';
    } else if (diffInDays == 1) {
      return 'Ends in 1 day';
    } else {
      return 'Ends in ' + diffInDays.toString() + 'days';
    }
  }
}
