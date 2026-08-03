import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Category } from '../shared/types/category';

type SurveyStatusFilter = 'active' | 'past' | null;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly surveyService = inject(SurveyService);

  dropdownOpened = signal<boolean>(false);
  selectedCategory = signal<Category>(null);

  selectedSurveyStatus = signal<SurveyStatusFilter>('active');

  yourSurveys = computed(() => {
    let surveys = this.surveyService.surveyList();
    let category = this.selectedCategory();
    let status = this.selectedSurveyStatus();
    return this.surveyService.surveyList().filter((survey) => {
      if (this.selectedCategory() == null) return true;
      return survey.category == this.selectedCategory() ? true : false;
    });
  });

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
    this.selectedCategory.set(value);
    this.toggleDropdown();
    this.setYourSurveysFilter(value);
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

  setYourSurveysFilter(filter: 'active' | 'past' | Category) {
    //this.yourSurveys.set(this.surveyService.surveyList());
    switch (filter) {
      case 'active':
        this.yourSurveys().filter((survey) => {
          const remainingDays = this.calcDateDiffDays(
            this.getTodaysShortISOString(),
            survey.endDate,
          );
          return remainingDays < 0 ? false : true;
        });
        break;
      case 'past':
        this.yourSurveys().filter((survey) => {
          if (!survey.endDate) return false;
          const remainingDays = this.calcDateDiffDays(
            this.getTodaysShortISOString(),
            survey.endDate,
          );
          return remainingDays > 0 ? false : true;
        });
        break;
      default:
        this.yourSurveys().filter((survey) => {
          return survey.category == filter ? true : false;
        });
        break;
    }
  }
}
