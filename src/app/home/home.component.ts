import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Category } from '../shared/types/category';
import { Survey } from '../shared/interfaces/survey';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  dropdownOpened = signal<boolean>(false);
  selectedCategory: Category = null;
  filteredSurveys = signal<Survey[]>([]);

  readonly surveyService = inject(SurveyService);

  endingSoonSurveys = computed(() => {
    return this.surveyService.surveyList().filter((survey) => {
      if (!survey.endDate) return false;
      const remainingDays = this.calcDateDiffDays(this.getTodaysShortISOString(), survey.endDate);
      return remainingDays >= 0 && remainingDays < 3;
    });
  });

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(value: Category): void {
    this.selectedCategory = value;
    this.toggleDropdown();
  }

  getRemainingDaysString(endDate: string): string {
    if (endDate == '') return 'Active';
    const todayStr = this.getTodaysShortISOString();
    const diffDays = this.calcDateDiffDays(todayStr, endDate);
    if (diffDays < 0) {
      return 'Ended';
    } else if (diffDays == 0) {
      return 'Ends today';
    } else if (diffDays == 1) {
      return 'Ends in 1 day';
    } else {
      return 'Ends in ' + diffDays.toString() + ' days';
    }
  }

  calcDateDiffDays(dateString1: string, dateString2: string): number {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    return date2.getDay() - date1.getDay();
  }

  getTodaysShortISOString(): string {
    let today = new Date();
    return today.toISOString().substring(0, 10);
  }
}
