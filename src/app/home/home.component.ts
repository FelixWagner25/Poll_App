import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Category } from '../shared/types/category';
import { calcDateDiffDays, getTodaysShortISOString } from '../shared/utilities/utilities';
import { NewSurveyComponent } from '../new-survey/new-survey.component';

type SurveyStatusFilter = 'active' | 'past';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NewSurveyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly surveyService = inject(SurveyService);

  dropdownOpened = signal<boolean>(false);
  selectedCategory = signal<Category>(null);

  selectedSurveyStatus = signal<SurveyStatusFilter>('active');
  overlayOpen = signal(false);

  yourSurveys = computed(() => {
    let surveys = this.surveyService.surveyList();
    let category = this.selectedCategory();
    let status = this.selectedSurveyStatus();
    const today = getTodaysShortISOString();
    return surveys.filter((survey) => {
      const matchedCategory = category === null || survey.category === category;
      if (!survey.endDate) return matchedCategory && status === 'active';
      const remainingDays = calcDateDiffDays(today, survey.endDate);
      const matchedStatus =
        (status === 'active' && remainingDays >= 0) || (status === 'past' && remainingDays < 0);
      //return survey.category == this.selectedCategory() ? true : false;
      return matchedCategory && matchedStatus;
    });
  });

  endingSoonSurveys = computed(() => {
    return this.surveyService
      .surveyList()
      .filter((survey) => {
        if (!survey.endDate) return false;
        const remainingDays = calcDateDiffDays(getTodaysShortISOString(), survey.endDate);
        return remainingDays >= 0 && remainingDays < 3;
      })
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 3);
  });

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(value: Category): void {
    this.selectedCategory.set(value);
    this.toggleDropdown();
  }

  getRemainingDaysString(endDate: string): string {
    if (endDate == '') return 'Active';
    const todayStr = getTodaysShortISOString();
    console.log('getTodaysShortISOString', todayStr);

    const diffDays = calcDateDiffDays(todayStr, endDate);
    console.log('endDate', endDate);

    console.log('diffDays', diffDays);

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

  activeSurveyFilter() {
    return this.selectedSurveyStatus() === 'active';
  }

  pastSurveyFilter() {
    return this.selectedSurveyStatus() === 'past';
  }

  openOverlay(): void {
    this.overlayOpen.set(true);
  }

  closeOverlay(): void {
    this.overlayOpen.set(false);
  }
}
